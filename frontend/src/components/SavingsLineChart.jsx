import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const SavingsLineChart = ({ history }) => {
  // history: array of { date, amount }
  // Sort by date ascending
  const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
  let total = 0;
  const labels = sorted.map(h => new Date(h.date).toLocaleDateString());
  const dataPoints = sorted.map(h => {
    total += h.amount;
    return total;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Total Savings Over Time',
        data: dataPoints,
        fill: true,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.08)',
        pointBackgroundColor: '#1976d2',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    layout: {
      padding: 32,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#222', font: { weight: 600 } },
        offset: true, // adds space before first and after last tick
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e3eafc' },
        ticks: { color: '#1976d2', font: { weight: 600 } },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: 400, background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px #e3eafc', padding: 32 }}>
      <h2 style={{ color: '#1976d2', marginBottom: 24, fontWeight: 700 }}>Overall Savings Over Time</h2>
      <Line data={data} options={options} height={120} />
    </div>
  );
};

export default SavingsLineChart;
