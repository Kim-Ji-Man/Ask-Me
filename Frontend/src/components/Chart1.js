import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Chart1 = () => {
  // CCTV별 데이터를 각각의 데이터셋으로 분리
  const data = {
    labels: ['CCTV 01', 'CCTV 02', 'CCTV 03', 'CCTV 04'], // x축에 각각의 CCTV 이름을 표시
    datasets: [
      {
        label: 'CCTV 01', // CCTV 01
        data: [12], // CCTV 01의 감지 숫자
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'CCTV 02', // CCTV 02
        data: [8], // CCTV 02의 감지 숫자
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'CCTV 03', // CCTV 03
        data: [4], // CCTV 03의 감지 숫자
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
      {
        label: 'CCTV 04', // CCTV 04
        data: [2], // CCTV 04의 감지 숫자
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // 옵션 설정
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        onClick: (e, legendItem, legend) => {
          // 클릭 시 해당 데이터셋을 토글합니다.
          const index = legendItem.datasetIndex;
          const chart = legend.chart;
          const dataset = chart.data.datasets[index];

          dataset.hidden = !dataset.hidden; // 토글 기능
          chart.update();
        },
      },
      title: {
        display: true,
        text: 'CCTV Detected Numbers',
      },
    },
    scales: {
      x: {
        stacked: true, // x축을 스택으로 설정하여 바가 겹치게 만듭니다.
        title: {
          display: true,
          text: 'CCTV Names', // x축에 표시될 텍스트
        },
      },
      y: {
        stacked: true, // y축을 스택으로 설정하여 바가 겹치게 만듭니다.
        title: {
          display: true,
          text: 'Detected Count', // y축에 표시될 텍스트
        },
      },
    },
  };

  return (
    <div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default Chart1;
