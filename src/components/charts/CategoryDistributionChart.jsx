import React from 'react';
import { Pie } from 'react-chartjs-2';

const CategoryDistributionChart = ({ data }) => {
  const chartData = {
    labels: data.map(([category]) => category),
    datasets: [
      {
        data: data.map(([, count]) => count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Distribution by Category</h2>
      <Pie data={chartData} />
    </div>
  );
};

export default CategoryDistributionChart;
