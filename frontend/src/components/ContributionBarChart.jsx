import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ContributionBarChart = ({ contributions }) => {
  // contributions: array of { productName, totalAmount }
  const data = {
    labels: contributions.map(c => c.productName),
    datasets: [
      {
        label: 'Total Saved',
        data: contributions.map(c => c.totalAmount),
        backgroundColor: '#1976d2',
        borderRadius: 8,
        barThickness: 48,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#222', font: { weight: 600 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e3eafc' },
        ticks: { color: '#1976d2', font: { weight: 600 } },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #e3eafc', padding: 32 }}>
      <h2 style={{ color: '#1976d2', marginBottom: 24, fontWeight: 700 }}>Savings Progress by Goal</h2>
      <Bar data={data} options={options} height={120} />
    </div>
  );
};

export default ContributionBarChart;
