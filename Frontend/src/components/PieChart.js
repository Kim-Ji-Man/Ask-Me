import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import axios from '../axios';

// Chart.js에 플러그인 등록
Chart.register(ChartDataLabels);

const PieChart = () => {
  const [chartData, setChartData] = useState(null);

  // 백엔드에서 anomaly_count 데이터를 가져오는 함수
  useEffect(() => {
    axios.get('/Alim/admin/anomaly-counts')
      .then(response => {
        const data = response.data;
        const labels = data.map(item => item.anomaly_type);
        const counts = data.map(item => item.count);

        setChartData({
          labels: labels,
          datasets: [
            {
              data: counts,
              // 흉기의심을 주황색(#FFA500)으로 추가
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FFA500'], 
              hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FFA500'],
            },
          ],
        });
      })
      .catch(error => console.error('데이터 가져오기 오류:', error));
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        color: 'black',
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}: ${value}`;
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '420px' }}>
      {chartData ? <Pie data={chartData} options={options} /> : <p>Loading...</p>}
    </div>
  );
};

export default PieChart;
