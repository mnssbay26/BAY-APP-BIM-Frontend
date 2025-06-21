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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DeviceWaterChart = ({ selectedDevice }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Water Consumption (L/h)',
        data: [],
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedDevice) {
        const currentWater = selectedDevice.waterUsage;
        const currentTime = new Date().toLocaleTimeString();

        setChartData((prevData) => {
          const newLabels = [...prevData.labels, currentTime];
          const newValues = [...prevData.datasets[0].data, currentWater];

          // Limit the chart to the last 10 data points
          if (newLabels.length > 10) {
            newLabels.shift();
            newValues.shift();
          }

          return {
            ...prevData,
            labels: newLabels,
            datasets: [
              {
                ...prevData.datasets[0],
                data: newValues,
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
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y: {
        suggestedMin: 0,
        suggestedMax: 30,
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
        }
      }
    }
  };

  if (!selectedDevice) {
    return (
      <div className="text-gray-400 text-sm">
        Select a device to see its water consumption
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100px', maxHeight: '180px' }}>
      <h3 className="text-sm font-bold mb-2">
        Humidity: {selectedDevice.name} ({selectedDevice.code})
      </h3>
      <div style={{ width: '100%', height: '100%', minHeight: '120px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DeviceWaterChart;
