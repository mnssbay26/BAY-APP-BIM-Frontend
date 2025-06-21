import React from 'react';

const DevicePopover = ({ device, onClose }) => {
  // Convertir la temperatura celsius a fahrenheit
  const fahrenheit = (device.temperature * 9) / 5 + 32;

  // Calculamos la temperatura corregida (según tu offset de -52°C, -112°F)
  // y usamos .toFixed(2) para redondear a 2 decimales:
  const correctedCelsius = (device.temperature - 47).toFixed(2);
  const correctedFahrenheit = (fahrenheit - 84).toFixed(2);

  // Para el consumo de energía, igual con 2 decimales:
  const powerUsage = device.powerUsage?.toFixed(2);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        padding: '10px',
        zIndex: 9999,
        borderRadius: '4px',
      }}
    >
      <button
        style={{ float: 'right', marginLeft: '8px', cursor: 'pointer' }}
        onClick={onClose}
      >
        X
      </button>
      <h4 className="font-bold mb-2">
        {device.name} - ({device.code})
      </h4>
      <p className="text-sm">Type: {device.type}</p>
      
      {/* Sólo mostrará temperatura si existe la propiedad */}
      {device.temperature !== undefined && (
        <p className="text-sm">
          Temp: {correctedCelsius}°C / {correctedFahrenheit}°F
        </p>
      )}

      {/* MOSTRAR la línea de "Consumo" SÓLO si es un tipo que maneje powerUsage */}
      {device.type === "Temperature" && (
        <p className="text-sm">
          Consume: {powerUsage ?? "N/A"} kWh
        </p>
      )}
    </div>
  );
};

export default DevicePopover;
