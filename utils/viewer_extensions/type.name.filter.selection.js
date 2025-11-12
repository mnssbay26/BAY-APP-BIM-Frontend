/* global Autodesk */

class TypeNameSelectionExtension extends Autodesk.Viewing.Extension {
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

  _extractTypeNameFromFlat = (flat) => {
    // Preferencia: "Type Name" (Revit), si no "Name" (Item/Element), si no NodeName
    const candidates = ["Type Name", "Name", "Element Name", "Item Name", "NodeName"];
    for (const k of candidates) {
      if (flat[k]) return this._norm(flat[k]);
    }
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

    this._button = new Autodesk.Viewing.UI.Button("selectTypeNameButton");
    this._button.setToolTip('Aislar por "Type Name" (tolerante NWD)');
    this._button.addClass("selectTypeCategoryIcon");

    this._button.onClick = async () => {
      const sel = this.viewer.getSelection();
      if (!sel || sel.length === 0) { console.warn("No elements selected."); return; }

      // 1) Obtener type name de referencia subiendo jerarquía
      const baseId = sel[0];
      const flat = await this._collectHierarchyProps(baseId, 6);
      const refType = this._extractTypeNameFromFlat(flat);
      if (!refType) { console.warn('No "Type Name"/"Name" found in hierarchy.'); return; }

      // 2) Buscar en visibles por "Type Name" o "Name"
      const candidates = this._getVisibleNodes();
      const propsToAsk = ["Type Name", "Name"];
      this.viewer.model.getBulkProperties(
        candidates,
        propsToAsk,
        (items) => {
          const matches = [];
          for (const it of items) {
            let ok = false;
            for (const p of it.properties || []) {
              if (propsToAsk.includes(p.displayName)) {
                if (this._norm(p.displayValue) === refType) { ok = true; break; }
              }
            }
            if (ok) matches.push(it.dbId);
          }
          if (matches.length === 0) { console.warn("No visible elements with that Type Name."); }
          this.viewer.isolate(matches);
        }
      );
    };

    this._group.addControl(this._button);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "TypeNameSelectionExtension",
  TypeNameSelectionExtension
);
