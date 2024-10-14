import React from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';

// Chart.js에 플러그인 등록
Chart.register(ChartDataLabels);

const PieChart = () => {
  const data = {
    labels: ['응답', '무응답', '오류'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        color: '#fff',
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}: ${value}`;
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '420px' }}>
     <Pie data={data} options={options} />;
    </div>
  );
};

export default PieChart;
