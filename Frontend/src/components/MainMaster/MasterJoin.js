import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 데이터 레이블 플러그인 추가
import "../../css/MasterJoin.css";

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    datalabels: {
      color: '#fff', // 데이터 레이블 색상
      anchor: 'center',
      align: 'center',
    },
  },
  scales: {
    x: {
      stacked: true, // 스택형으로 설정
      ticks: {
        align: 'center', // x축 레이블 가운데 정렬
      },
    },
    y: {
      beginAtZero: true,
      stacked: true, // 스택형으로 설정
    },
  },
};

// 랜덤 데이터 생성 함수
const generateRandomData = () => {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));
};

const MasterJoin = () => {
  const [data, setData] = useState({
    labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    datasets: [
      {
        label: '관리자',
        data: generateRandomData(),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: '경비원',
        data: generateRandomData(),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: '일반 사용자',
        data: generateRandomData(),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });

  return (
    <div className="chart-container">
      <h5 className="chart-title">월별 사용자 통계</h5>
      <Bar data={data} options={options} style={{marginTop:'60px'}} />
    </div>
  );
};

export default MasterJoin;
