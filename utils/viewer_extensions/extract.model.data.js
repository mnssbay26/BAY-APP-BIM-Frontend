/* global Autodesk */

class ModeDataExtractionExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._group = null;
    this._button = null;
  }

  load() { return true; }

  unload() {
    if (this._button) {
      this._group.removeControl(this._button);
      this._button = null;
    }
    return true;
  }

  // ---- helpers ----
  _getProps = (id) =>
    new Promise((resolve) => {
      this.viewer.getProperties(id, (data) => resolve(data || { properties: [] }));
    });

  _mergeProps(target, propsArray) {
    for (const p of propsArray) {
      const key = p.displayName;
      const val = (p.displayValue ?? "").toString();
      if (target[key] === undefined) target[key] = val || "no especificado";
    }
  }

  _applySynonyms(flat) {
    // sinónimos típicos al trabajar con NWD/derivados
    const synonyms = [
      ["Type Name", "TypeName"],
      ["Name", "TypeName"],                 // en NWD “Name” suele ser el type/name útil
      ["Panel Material", "Material"],
      ["Revit Material", "Material"],
      ["Material Name", "Material"],
      ["Family", "Category"],
      ["Type", "Category"],                 // a veces “Type” es el contenedor de categoría
      ["Category Name", "Category"],
    ];
    for (const [src, dst] of synonyms) {
      if (flat[src] && !flat[dst]) flat[dst] = flat[src];
    }
  }

  async _collectHierarchyProps(dbId, maxLevels = 5) {
    const tree = this.viewer.model?.getData()?.instanceTree;
    const flat = {};
    let current = dbId;
    let level = 0;

    while (current != null && current !== -1 && level < maxLevels) {
      const data = await this._getProps(current);
      this._mergeProps(flat, data.properties || []);

      // Nombre del nodo (útil cuando “Name” no viene en props)
      if (!flat["Name"] && tree?.getNodeName) {
        const nodeName = tree.getNodeName(current);
        if (nodeName) flat["Name"] = nodeName;
      }

      // subir
      if (tree?.getNodeParentId) {
        current = tree.getNodeParentId(current);
      } else {
        break;
      }
      level++;
    }

    // normaliza claves para que propertyMappings las pueda mapear
    this._applySynonyms(flat);
    return flat;
  }

  onToolbarCreated() {
    this._group =
      this.viewer.toolbar.getControl("allDataExtractionControls") ||
      new Autodesk.Viewing.UI.ControlGroup("allDataExtractionControls");
    this.viewer.toolbar.addControl(this._group);

    this._button = new Autodesk.Viewing.UI.Button("extractDataButton");
    this._button.setToolTip("Extraer Datos");
    this._button.addClass("extractDataIcon");

    this._button.onClick = async () => {
      const selection = this.viewer.getSelection();
      if (!selection || selection.length === 0) return;

      try {
        const payloads = await Promise.all(
          selection.map(async (dbId) => {
            const merged = await this._collectHierarchyProps(dbId, 6); // sube hasta 6 niveles
            return { dbId, properties: merged };
          })
        );

        // emite un evento por cada elemento (compatible con tu listener actual)
        for (const { dbId, properties } of payloads) {
          const ev = new CustomEvent("dbIdDataExtracted", {
            detail: { dbId, properties },
          });
          window.dispatchEvent(ev);
        }
      } catch (err) {
        console.error("Extraction error:", err);
      }
    };

    this._group.addControl(this._button);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "ModeDataExtractionExtension",
  ModeDataExtractionExtension
);
