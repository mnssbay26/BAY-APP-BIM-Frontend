/* global THREE, Autodesk */
import { RoomSensorPanel } from "./room.sensor.panel";

/**
 * Datos de ejemplo
 */
const devicesData = [
  {
    id: 1,
    name: "Electrical Room",
    dbIds: [1485],
    position: { x: 61.451271057128906, y:-259.31407928466797, z: -31.2991943359375 },
    code: "SR",
    type: "Room Sensor",
    temperature: 70,
    humdity: 30,
    AirQuality: 100
  },
  {
    id: 2,
    name: "Pumps Room",
    dbIds: [1497],
    position: { x: 69.78491973876953, y: -286.14739990234375, z: -31.5491943359375 },
    code: "LR",
    type: "Room Sensor",
    temperature: 72,
    humdity: 40,
    AirQuality: 100
  },
  
];

/**
 * Extensión principal
 */
class DataRoomSensors extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._viewer = viewer;
    this._options = options;

    this._roomPanel = null;      // Panel flotante (opcional)
    this._viewableData = null;   // Contenedor para sprites
    this._dataVizExt = null;     // Referencia a Data Visualization Extension
  }

  load() {
    console.log("DataRoomSensors cargada");
    // Asegurarnos de tener la extensión DataVisualization
    this._viewer.loadExtension("Autodesk.DataVisualization").then((ext) => {
      this._dataVizExt = ext;
    });

    // Crear el panel flotante (si se desea mostrar info al clicar sprites)
    this._roomPanel = new RoomSensorPanel(
      this._viewer,
      "roomSensorPanelId",
      "Información de la Room",
      { width: "300px", height: "150px" }
    );
    this._roomPanel.setVisible(false);

    // Crear botones en la toolbar
    if (this._viewer.toolbar) {
      this.onToolbarCreated();
    } else {
      this._viewer.addEventListener(
        Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
        () => this.onToolbarCreated()
      );
    }

    return true;
  }

  unload() {
    if (this._roomPanel) {
      this._roomPanel.setVisible(false);
      this._roomPanel = null;
    }
    console.log("DataRoomSensors descargada");
    return true;
  }

  onToolbarCreated() {
    // Reutilizamos o creamos un grupo en la toolbar
    this._group =
      this._viewer.toolbar.getControl("7DDataPointsControls") ||
      new Autodesk.Viewing.UI.ControlGroup("7DDataPointsControls");
    this._viewer.toolbar.addControl(this._group);

    // Botón para mostrar sprites
    this._button = new Autodesk.Viewing.UI.Button("RoomSensorBtn");
    this._button.setToolTip("Mostrar Sprites (Rooms)");
    this._button.addClass("RoomSensorBtnClass");
    this._button.onClick = () => this.showSprites();
    this._group.addControl(this._button);

    // Botón para mostrar Heatmap
    this._buttonHeatmap = new Autodesk.Viewing.UI.Button("RoomHeatmapBtn");
    this._buttonHeatmap.setToolTip("Mostrar Heatmap (Planar)");
    this._buttonHeatmap.addClass("RoomHeatmapBtnClass");
    this._buttonHeatmap.onClick = () => this.showPlanarHeatmap();
    this._group.addControl(this._buttonHeatmap);
  }

  /**
   * 1) Muestra los sprites en el Viewer
   */
  async showSprites() {
    if (!this._dataVizExt) {
      console.error("DataViz extension no lista.");
      return;
    }
    const dataVisCore = Autodesk.DataVisualization.Core;

    // Clic en sprite => mostrar panel
    this._viewer.addEventListener(dataVisCore.MOUSE_CLICK, (event) => {
      const clickedDbId = event.dbId;
      if (clickedDbId !== 0) {
        const device = devicesData.find((dev) => dev.dbId === clickedDbId);
        if (device) {
          // Actualiza panel con info del device
          this._roomPanel.updateData(device);
          this._roomPanel.setVisible(true);

          // Callback a React, si se desea
          if (this._options?.onSpriteClick) {
            this._options.onSpriteClick(device);
          }
        }
      }
    });

    // Estilo del sprite
    const spriteStyle = new dataVisCore.ViewableStyle(
      dataVisCore.ViewableType.SPRITE,
      new THREE.Color(0xff0000),
      "https://cdn-icons-png.flaticon.com/512/2540/2540201.png",
      new THREE.Color(0x00ff00),
      "https://cdn-icons-png.flaticon.com/512/2540/2540201.png"
    );

    // Contenedor de viewables
    this._viewableData = new dataVisCore.ViewableData();
    this._viewableData.spriteSize = 25;

    // Asignar un "dbId" ficticio a cada sensor (para el sprite)
    devicesData.forEach((dev, index) => {
      const dbId = 200 + index;
      dev.dbId = dbId;

      let sprite = new dataVisCore.SpriteViewable(dev.position, spriteStyle, dbId);
      sprite.myContextData = {
        code: dev.code,
        type: dev.type,
      };
      this._viewableData.addViewable(sprite);
    });

    await this._viewableData.finish();
    this._dataVizExt.addViewables(this._viewableData);
  }

  /**
   * 2) Crea y dibuja el "Planar Heatmap" sobre las rooms
   */
  async showPlanarHeatmap() {
    if (!this._dataVizExt) {
      console.error("DataViz extension no lista.");
      return;
    }

    const dataVisCore = Autodesk.DataVisualization.Core;
    const model = this._viewer.model;

    // a) Creamos un nodo que represente las 3 rooms (según sus dbIds reales)
    const allRoomDbIds = [39949, 39915, 40067];
    const shadingNode = new dataVisCore.SurfaceShadingNode(
      "PlanarHeatmapRoom",
      allRoomDbIds
    );

    // b) Añadimos "SurfaceShadingPoints" (uno por sensor).
    //    Como "position", en Data Viz la Z no se suele usar para "Planar".
    //    Aunque aquí pasamos Vector3(...x,y,z?), se centrará en x,y.
    devicesData.forEach((dev) => {
      const point = new dataVisCore.SurfaceShadingPoint(
        dev.name,
        new THREE.Vector3(dev.position.x, dev.position.y),
        ["temperature"]
      );
      shadingNode.addPoint(point);
    });

    // c) Preparamos SurfaceShadingData
    const heatmapData = new dataVisCore.SurfaceShadingData();
    heatmapData.addChild(shadingNode);
    heatmapData.initialize(model);

    // d) setupSurfaceShading con opciones avanzadas
    await this._dataVizExt.setupSurfaceShading(model, heatmapData, {
      type: "PlanarHeatmap",
      slicingEnabled: false,
      slicingPosition: 0.5,   // ejemplo de slicingPosition
      placementPosition: 1,   // ejemplo de "altura" de la proyección
      minOpacity: 0.0,        // opacidad mínima
      maxOpacity: 1         // opacidad máxima
    });

    // e) Registrar colores
    const sensorColors = [0x0000ff, 0x00ff00, 0xffff00, 0xff0000];
    const sensorType = "temperature";
    this._dataVizExt.registerSurfaceShadingColors(sensorType, sensorColors);

    // f) Función "getSensorValue" => normaliza la temperatura [0..1]
    const getSensorValue = (surfaceShadingPoint, sensorType, pointData) => {
      // Buscar el device por su nombre
      const dev = devicesData.find((d) => d.name === surfaceShadingPoint.id);
      if (!dev) return 0.0;

      const minTemp = 50;
      const maxTemp = 90;
      const t = dev.temperature;
      const val = (t - minTemp) / (maxTemp - minTemp);
      return Math.min(Math.max(val, 0), 1); // clamp
    };

    // g) Render con "confidence = 180"
    this._dataVizExt.renderSurfaceShading(
      "PlanarHeatmapRoom",
      sensorType,
      getSensorValue,
      {
        confidence: 240
      }
    );

    console.log("Planar Heatmap renderizado sobre rooms con confidence=180 y maxOpacity=0.8");
  }

  /**
   * (Opcional) Simula cambios de temperatura
   */
  simulateChanges() {
    devicesData.forEach((dev) => {
      // Aumentar/disminuir temperatura aleatoriamente
      const change = Math.random() < 0.5 ? -1 : 1;
      dev.temperature += change;
      dev.temperature = Math.min(90, Math.max(50, dev.temperature));
    });
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  "DataRoomSensors",
  DataRoomSensors
);
