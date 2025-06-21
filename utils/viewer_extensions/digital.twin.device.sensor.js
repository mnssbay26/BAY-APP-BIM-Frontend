/* global THREE */
/* global Autodesk */

import temperatureData from "../viewer_extensions/temperature.data";
import waterUsageData from "../viewer_extensions/water.usage";

class DataDeviceSensors extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._viewer = viewer;
    this._options = options;

    this.projectId = options.projectId;
    this._group = null;
    this._button = null;
    this._viewableData = null;
    this._updateInterval = null;

    // Índices para recorrer arreglos cíclicamente
    this._tempIndex = 0;
    this._waterIndex = 0;

    console.log("Project ID:", this.projectId);

    if (this.projectId === "b.7b87aeaa-705f-4d0a-ade6-e10617f7da0d") {
      // Proyecto con 6 sprites
      this.devicesData = [
        {
          id: 1,
          name: "Sprite1",
          position: { x: 242.74, y: 312.19, z: 377.09 },
          code: "S1",
          type: "Sprite",
          temperature: 0,  // Para no ser undefined
          powerUsage: 0,
          waterUsage: 0
        },
        {
          id: 2,
          name: "Sprite2",
          position: { x: 242.75, y: 339.19, z: 377.09 },
          code: "S2",
          type: "Sprite",
          temperature: 0,
          powerUsage: 0,
          waterUsage: 0
        },
        {
          id: 3,
          name: "Sprite3",
          position: { x: 242.74, y: 370.19, z: 377.09 },
          code: "S3",
          type: "Sprite",
          temperature: 0,
          powerUsage: 0,
          waterUsage: 0
        },
        {
          id: 4,
          name: "Sprite4",
          position: { x: 242.75, y: 397.19, z: 377.09 },
          code: "S4",
          type: "Sprite",
          temperature: 0,
          powerUsage: 0,
          waterUsage: 0
        },
        {
          id: 5,
          name: "Sprite5",
          position: { x: 242.74, y: 428.19, z: 377.09 },
          code: "S5",
          type: "Sprite",
          temperature: 0,
          powerUsage: 0,
          waterUsage: 0
        },
        {
          id: 6,
          name: "Sprite6",
          position: { x: 242.75, y: 455.19, z: 377.09 },
          code: "S6",
          type: "Sprite",
          temperature: 0,
          powerUsage: 0,
          waterUsage: 0
        }
      ];
    } else if (this.projectId === "b.8f93b75d-74d7-4a2b-9365-1ddf6a953869") {
      // Otro proyecto
      this.devicesData = [
        {
          id: 1,
          name: "Equipment1",
          position: { x: 29.4244, y: -244.6151, z: -28.4202 },
          code: "E1",
          type: "Temperature",
          temperature: 20,
          powerUsage: 0,
          waterUsage: 0
        },
        {
          id: 2,
          name: "Equipment2",
          position: { x: 29.4244, y: -248.6151, z: -28.4202 },
          code: "E2",
          type: "Temperature",
          temperature: 24,
          powerUsage: 8,
          waterUsage: 2
        }
      ];
    } else {
      // Por defecto, sin equipos
      this.devicesData = [];
    }
  }

  load() {
    console.log("Data 7D Extension loaded");
    console.log("project ID:", this.projectId);

    this.viewer.loadExtension("Autodesk.DataVisualization");

    if (this.viewer.toolbar) {
      this.onToolbarCreated();
    } else {
      this.viewer.addEventListener(
        Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
        () => this.onToolbarCreated()
      );
    }

    // Intervalo para simular cambios
    this._updateInterval = setInterval(() => {
      this.simulateChanges();
    }, 2000);

    return true;
  }

  unload() {
    if (this._button) {
      this._group.removeControl(this._button);
      this._button = null;
    }
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
    }
    console.log("Data 7D Extension unloaded");
    return true;
  }

  onToolbarCreated() {
    this._group =
      this.viewer.toolbar.getControl("7DDataPointsControls") ||
      new Autodesk.Viewing.UI.ControlGroup("7DDataPointsControls");
    this.viewer.toolbar.addControl(this._group);

    this._button = new Autodesk.Viewing.UI.Button("7DDataButton");
    this._button.setToolTip("Show 7D Data Sprites");
    this._button.addClass("DataDeviceSensorsClass");

    this._button.onClick = async () => {
      const dataVisExtension = this.viewer.getExtension("Autodesk.DataVisualization");
      if (!dataVisExtension) {
        console.error("Data Visualization extension is not loaded");
        return;
      }

      const dataVisCore = Autodesk.DataVisualization.Core;

      // Al hacer click en un sprite
      this.viewer.addEventListener(dataVisCore.MOUSE_CLICK, (event) => {
        const clickedDbId = event.dbId;
        if (clickedDbId !== 0) {
          const device = this.devicesData.find((dev) => dev.dbId === clickedDbId);
          if (device) {
            console.log("Sprite clicked:", device);

            if (this._options && this._options.onSpriteClick) {
              this._options.onSpriteClick(device);
            }
          }
        }
      });

      // Estilo de sprite
      const spriteStyle = new dataVisCore.ViewableStyle(
        dataVisCore.ViewableType.SPRITE,
        new THREE.Color(0xff0000),
        "https://cdn-icons-png.flaticon.com/512/2540/2540201.png"
      );

      // Contenedor para viewables
      this._viewableData = new dataVisCore.ViewableData();
      this._viewableData.spriteSize = 25;

      // Asigna un dbId a cada dispositivo
      this.devicesData.forEach((dev, index) => {
        const dbId = 10 + index;
        dev.dbId = dbId;

        const sprite = new dataVisCore.SpriteViewable(
          dev.position,
          spriteStyle,
          dbId
        );

        sprite.myContextData = {
          code: dev.code,
          type: dev.type
        };

        this._viewableData.addViewable(sprite);
      });

      await this._viewableData.finish();
      dataVisExtension.addViewables(this._viewableData);
    };

    this._group.addControl(this._button);
  }

  simulateChanges() {
    this.devicesData.forEach((dev) => {
      // Solo si dev tiene temperature/powerUsage/waterUsage
      if (
        dev.temperature !== undefined &&
        dev.powerUsage !== undefined &&
        dev.waterUsage !== undefined
      ) {
        if (dev.name === "Equipment1") {
          // Temperatura fluctúa ±0.3 dentro 22..24
          const tempChange = Math.random() < 1 ? -0.5 : 2;
          dev.temperature += tempChange;
          if (dev.temperature < 22) dev.temperature = 62;
          if (dev.temperature > 24) dev.temperature = 64;
  
          const powerChange = Math.random() < 0.5 ? -0.5 : 0.5;
          dev.powerUsage += powerChange;
          if (dev.powerUsage < 0) dev.powerUsage = 0;
          if (dev.powerUsage > 10) dev.powerUsage = 10;
  
          const waterChange = Math.random() < 0.5 ? -2 : 2;
          dev.waterUsage += waterChange;
          if (dev.waterUsage < 0) dev.waterUsage = 0;
          if (dev.waterUsage > 25) dev.waterUsage = 25;
        }
        else if (dev.name === "Equipment2") {
          // Temperatura fluctúa ±0.2 dentro 24..26
          const tempChange = Math.random() < 1 ? -0.5 : 2;
          dev.temperature += tempChange;
          if (dev.temperature < 24) dev.temperature = 64;
          if (dev.temperature > 26) dev.temperature = 66;
  
          const powerChange = Math.random() < 0.5 ? -0.3 : 0.3;
          dev.powerUsage += powerChange;
          if (dev.powerUsage < 6) dev.powerUsage = 6;
          if (dev.powerUsage > 10) dev.powerUsage = 10;
  
          const waterChange = Math.random() < 0.5 ? -0.2 : 0.2;
          dev.waterUsage += waterChange;
          if (dev.waterUsage < 2) dev.waterUsage = 2;
          if (dev.waterUsage > 5) dev.waterUsage = 5;
        }
        else if (
          dev.name === "Sprite1" ||
          dev.name === "Sprite2" ||
          dev.name === "Sprite3" ||
          dev.name === "Sprite4" ||
          dev.name === "Sprite5" ||
          dev.name === "Sprite6"
        ) {
          // Estos dispositivos usan arrays de datos
          dev.temperature = temperatureData[this._tempIndex];
          
          const powerChange = Math.random() < 0.5 ? -0.3 : 0.3;
          dev.powerUsage += powerChange;
          if (dev.powerUsage < 6) dev.powerUsage = 6;
          if (dev.powerUsage > 10) dev.powerUsage = 10;
  
          dev.waterUsage = waterUsageData[this._waterIndex];
        }
      }
    });
  
    // Avanzamos índice cíclico
    this._tempIndex = (this._tempIndex + 1) % temperatureData.length;
    this._waterIndex = (this._waterIndex + 1) % waterUsageData.length;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension("DataDeviceSensors", DataDeviceSensors);
