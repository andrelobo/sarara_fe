import React from 'react';
import { Bar } from 'react-chartjs-2';

const QuantityByCategoryChart = ({ data }) => {
  const chartData = {
    labels: data.map(([category]) => category),
    datasets: [
      {
        label: 'Quantity',
        data: data.map(([, quantity]) => quantity),
        backgroundColor: '#FF6384',
        borderColor: '#FF6384',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Quantity by Category</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default QuantityByCategoryChart;
