/* global Autodesk */

class CategorySelectionExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
  }

  load() { return true; }
  unload() {
    if (this._button) { this._group.removeControl(this._button); this._button = null; }
    return true;
  }

  // ---------- helpers ----------
  _getProps = (id) => new Promise((resolve) => {
    this.viewer.getProperties(id, (data) => resolve(data || { properties: [] }));
  });

  _collectHierarchyProps = async (dbId, maxLevels = 6) => {
    const tree = this.viewer.model?.getData()?.instanceTree;
    const flat = {};
    let current = dbId, level = 0;

    while (current != null && current !== -1 && level < maxLevels) {
      const data = await this._getProps(current);
      (data.properties || []).forEach(p => {
        const k = p.displayName, v = (p.displayValue ?? "").toString();
        if (flat[k] === undefined) flat[k] = v;
      });
      if (tree?.getNodeName && !flat["NodeName"]) {
        flat["NodeName"] = tree.getNodeName(current) || "";
      }
      current = tree?.getNodeParentId ? tree.getNodeParentId(current) : null;
      level++;
    }
    return flat;
  };

  _norm = (s) => (s || "").toString().replace(/\s*\[.*?\]\s*/g, "").trim().toLowerCase();

  _extractCategoryFromFlat = (flat) => {
    // orden de preferencia + sinónimos típicos en NWD
    const keys = ["Category", "Category Name", "Family", "Type"];
    for (const k of keys) {
      if (flat[k]) return this._norm(flat[k]);
    }
    // fallback: a veces el nombre del nodo ya es la familia/categoría
    if (flat.NodeName) return this._norm(flat.NodeName);
    return "";
  };

  _getAllDescendants = (tree, parentId, out) => {
    tree.enumNodeChildren(parentId, (cid) => {
      out.push(cid);
      this._getAllDescendants(tree, cid, out);
    });
  };

  _getVisibleNodes = () => {
    const tree = this.viewer.model.getData().instanceTree;
    const root = tree.getRootId();
    const all = [];
    this._getAllDescendants(tree, root, all);

    const vm =
      (this.viewer.impl && this.viewer.impl.visibilityManager) ||
      (this.viewer.model?.getVisibilityManager?.());
    if (!vm) return all;

    const visible = [];
    for (const id of all) {
      try { if (vm.getNodeVisibility(id)) visible.push(id); }
      catch { /* ignore */ }
    }
    return visible;
  };

  onToolbarCreated() {
    this._group =
      this.viewer.toolbar.getControl("TADCustomControls") ||
      new Autodesk.Viewing.UI.ControlGroup("TADCustomControls");
    this.viewer.toolbar.addControl(this._group);

    this._button = new Autodesk.Viewing.UI.Button("selectCategoryButton");
    this._button.setToolTip("Aislar por Categoría (tolerante NWD)");
    this._button.addClass("selectCategoryIcon");

    this._button.onClick = async () => {
      const sel = this.viewer.getSelection();
      if (!sel || sel.length === 0) { console.warn("No elements selected."); return; }

      // 1) Tomar la categoría de referencia subiendo en la jerarquía
      const baseId = sel[0];
      const flat = await this._collectHierarchyProps(baseId, 6);
      const refCat = this._extractCategoryFromFlat(flat);
      if (!refCat) { console.warn("No Category found in hierarchy."); return; }

      // 2) Buscar en nodos visibles usando sinónimos
      const targetDbIds = this._getVisibleNodes();
      const propsToAsk = ["Category", "Category Name", "Family", "Type", "Name"];
      this.viewer.model.getBulkProperties(
        targetDbIds,
        propsToAsk,
        (items) => {
          const matches = [];
          for (const it of items) {
            let found = "";
            for (const p of it.properties || []) {
              if (["Category", "Category Name", "Family", "Type", "Name"].includes(p.displayName)) {
                const n = this._norm(p.displayValue);
                // compara contra ref (ej. "generic models")
                if (n && (n === refCat)) { found = n; break; }
              }
            }
            if (found) matches.push(it.dbId);
          }
          if (matches.length === 0) { console.warn("No visible elements for that category."); }
          this.viewer.isolate(matches);
        }
      );
    };

    this._group.addControl(this._button);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "CategorySelectionExtension",
  CategorySelectionExtension
);
