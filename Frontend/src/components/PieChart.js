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

        // "흉기탐지"를 제외한 데이터 필터링
        const filteredData = data.filter(item => item.anomaly_type !== '흉기탐지');

        const labels = filteredData.map(item => item.anomaly_type);
        const counts = filteredData.map(item => item.count);

        setChartData({
          labels: labels,
          datasets: [
            {
              data: counts,
              // 흉기의심을 주황색(#FFA500)으로 추가했지만 이제는 제외됨
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], 
              hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
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