/* global Autodesk */

export class RoomSensorPanel extends Autodesk.Viewing.UI.DockingPanel {
    constructor(viewer, panelId, title, options) {
      super(viewer.container, panelId, title, options);
  
      // Ajustes mínimos para el panel
      this.container.style.top = options?.top || "10px";
      this.container.style.left = options?.left || "10px";
      this.container.style.width = options?.width || "300px";
      this.container.style.height = options?.height || "150px";
  
      // Asignar clase CSS (por si quieres agregar estilos extras en un archivo CSS).
      this.container.classList.add('room-sensor-panel');
  
      // --- FONDO NEGRO Y TEXTO EN BLANCO ---
      this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; 
      this.container.style.color = '#ffffff';
  
      // Aquí almacenamos el contenido real
      this._content = document.createElement("div");
      this._content.style.margin = "10px";
      this.container.appendChild(this._content);
    }
  
    /**
     * Método para actualizar la información que se muestra dentro del panel,
     * por ejemplo temperatura, humedad, etc.
     */
    updateData(sensor) {
      if (!sensor) {
        this._content.innerHTML = "<p>No hay datos de sensor...</p>";
        return;
      }
  
      this._content.innerHTML = `
        <div>
          <h3 style="margin-bottom: 8px;">${sensor.name} (${sensor.code})</h3>
          <p><strong>Temperatura:</strong> ${sensor.temperature} °F</p>
          <p><strong>Humedad:</strong> ${sensor.humdity} %</p>
          <p><strong>Calidad del Aire:</strong> ${sensor.AirQuality} (arbitrary index)</p>
        </div>
      `;
    }
  }
  