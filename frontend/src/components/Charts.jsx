import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

// Category Spending Chart (Doughnut)
export const CategoryChart = ({ expenses, isDarkMode }) => {
  const categoryData = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
          '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56',
          '#9966FF', '#FF9F40', '#C9CBCF', '#4BC0C0'
        ],
        borderColor: isDarkMode ? '#2D3748' : '#FFFFFF',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8,
        cutout: '40%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#E2E8F0' : '#2D3748',
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
          },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF',
        titleColor: isDarkMode ? '#E2E8F0' : '#2D3748',
        bodyColor: isDarkMode ? '#E2E8F0' : '#2D3748',
        borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.raw.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
};

// Monthly Spending Trends (Line Chart)
export const TrendsChart = ({ trends, isDarkMode }) => {
  const labels = trends.map(trend => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[trend._id.month - 1]} ${trend._id.year}`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Monthly Spending',
        data: trends.map(trend => trend.totalAmount),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#36A2EB',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Transactions Count',
        data: trends.map(trend => trend.count * 1000), // Scale for visibility
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
        pointBackgroundColor: '#FF6384',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#E2E8F0' : '#2D3748',
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF',
        titleColor: isDarkMode ? '#E2E8F0' : '#2D3748',
        bodyColor: isDarkMode ? '#E2E8F0' : '#2D3748',
        borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            if (context.datasetIndex === 1) {
              return `${context.dataset.label}: ${context.raw / 1000} transactions`;
            }
            return `${context.dataset.label}: ₹${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDarkMode ? '#A0AEC0' : '#4A5568',
        },
        grid: {
          color: isDarkMode ? '#4A5568' : '#E2E8F0',
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          color: isDarkMode ? '#A0AEC0' : '#4A5568',
          callback: function(value) {
            return '₹' + value.toLocaleString();
          },
        },
        grid: {
          color: isDarkMode ? '#4A5568' : '#E2E8F0',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: {
          color: isDarkMode ? '#A0AEC0' : '#4A5568',
          callback: function(value) {
            return Math.round(value / 1000);
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

// Category Comparison (Bar Chart)
export const CategoryBarChart = ({ summary, isDarkMode }) => {
  const data = {
    labels: summary.map(item => item._id),
    datasets: [
      {
        label: 'Amount Spent',
        data: summary.map(item => item.totalAmount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
        ],
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 60,
        maxBarThickness: 80,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 10,
        left: 5,
        right: 5
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF',
        titleColor: isDarkMode ? '#E2E8F0' : '#2D3748',
        bodyColor: isDarkMode ? '#E2E8F0' : '#2D3748',
        borderColor: isDarkMode ? '#4A5568' : '#E2E8F0',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return [
              `Amount: ₹${context.raw.toLocaleString()}`,
              `Transactions: ${summary[context.dataIndex].count}`,
              `Average: ₹${Math.round(summary[context.dataIndex].avgAmount)}`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        categoryPercentage: 0.6,
        barPercentage: 0.8,
        ticks: {
          color: isDarkMode ? '#A0AEC0' : '#4A5568',
          maxRotation: 45,
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: isDarkMode ? '#A0AEC0' : '#4A5568',
          callback: function(value) {
            return '₹' + value.toLocaleString();
          },
        },
        grid: {
          color: isDarkMode ? '#4A5568' : '#E2E8F0',
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};