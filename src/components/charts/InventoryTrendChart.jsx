import React from 'react';
import { Line } from 'react-chartjs-2';

const InventoryTrendChart = ({ data }) => {
  const chartData = {
    labels: data.length ? data[0].history.map(entry => new Date(entry.date).toLocaleDateString()) : [],
    datasets: data.map(beverage => ({
      label: beverage.name,
      data: beverage.history.map(entry => entry.quantity),
      fill: false,
      backgroundColor: '#36A2EB',
      borderColor: '#36A2EB',
    })),
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Inventory Trends</h2>
      <Line data={chartData} />
    </div>
  );
};

export default InventoryTrendChart;
