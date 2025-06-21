import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrar
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Muestra la temperatura en tiempo real en dos escalas (°C y °F).
 * NOTA: Asumimos que selectedDevice.temperature está en °F.
 */
const RealTimeChart = ({ selectedDevice }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Temperatura °C',
        data: [],
        borderColor: 'rgb(255, 99, 132)', // rojo
        tension: 0.1,
        yAxisID: 'y', // Eje principal (Celsius)
      },
      {
        label: 'Temperatura °F',
        data: [],
        borderColor: 'rgb(54, 162, 235)', // azul
        tension: 0.1,
        yAxisID: 'yF', // Eje secundario (Fahrenheit)
      }
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedDevice) {
        // INTERPRETAR LA TEMPERATURA EN °F
        const fahrenheit = selectedDevice.temperature || 0;

        // Calcular °C a partir de °F
        const celsius = (fahrenheit - 32) * (5 / 9);

        const currentTime = new Date().toLocaleTimeString();

        setChartData((prevData) => {
          const newLabels = [...prevData.labels, currentTime];
          const newCelsiusValues = [...prevData.datasets[0].data, celsius];
          const newFahrenheitValues = [...prevData.datasets[1].data, fahrenheit];

          // Limitar a últimas 10 muestras
          if (newLabels.length > 10) {
            newLabels.shift();
            newCelsiusValues.shift();
            newFahrenheitValues.shift();
          }

          return {
            ...prevData,
            labels: newLabels,
            datasets: [
              {
                ...prevData.datasets[0],
                data: newCelsiusValues,
              },
              {
                ...prevData.datasets[1],
                data: newFahrenheitValues,
              },
            ],
          };
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedDevice]);

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Ocupar más espacio vertical
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      },
      // Eje para Celsius
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        max: 50, // Ajusta si esperas valores mayores/menores
        title: {
          display: true,
          text: '°C'
        },
        ticks: {
          font: {
            size: 10
          }
        }
      },
      // Eje para Fahrenheit
      yF: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: 120, // Ajusta si vas a superar 120°F
        title: {
          display: true,
          text: '°F'
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: 10
          }
        }
      },
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: 10
          }
        },
        position: 'top',
      }
    }
  };

  if (!selectedDevice) {
    return (
      <div className="text-gray-400 text-sm">
        Select a device to display temperature.
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100px', maxHeight: '180px' }}>
      <h3 className="text-sm font-bold mb-2">
        Temperature: {selectedDevice.name} ({selectedDevice.code})
      </h3>
      <div style={{ width: '100%', height: '100%', minHeight: '120px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RealTimeChart;
