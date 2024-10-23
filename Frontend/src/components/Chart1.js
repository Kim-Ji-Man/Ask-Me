import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // 데이터 레이블 플러그인 추가
import "../css/TimeChart.css";
import { Form } from 'react-bootstrap';

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
      color: '#000', // 데이터 레이블 색상
      anchor: 'center', // 데이터 레이블 위치 조정
      align: 'center', // 데이터 레이블 정렬
    },
  },
  scales: {
    x: {
      stacked: false, // 스택형 해제
      ticks: {
        align: 'center', // x축 레이블 가운데 정렬
      },
    },
    y: {
      beginAtZero: true,
    },
  },
};

// 랜덤 데이터 생성 함수
const generateRandomData = () => {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 200));
};

const Chart1 = () => {
  const [selectedDay, setSelectedDay] = useState(1); // 선택된 날짜
  const [data, setData] = useState({
    labels: ['CCTV1', 'CCTV2', 'CCTV3', 'CCTV4'],
    datasets: [
      {
        label: '들어온 사람',
        data: generateRandomData(), // 랜덤 데이터 생성
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 1.0,
      },
      {
        label: '나간 사람',
        data: generateRandomData(), // 랜덤 데이터 생성
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 1.0,
      },
    ],
  });

  // 날짜 변경 핸들러
  const handleDayChange = (event) => {
    const day = event.target.value;
    setSelectedDay(day);
    setData({
      labels: ['CCTV1', 'CCTV2', 'CCTV3', 'CCTV4'],
      datasets: [
        {
          label: '들어온 사람',
          data: generateRandomData(), // 새로운 랜덤 데이터 생성
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          barPercentage: 0.8,
          categoryPercentage: 1.0,
        },
        {
          label: '나간 사람',
          data: generateRandomData(), // 새로운 랜덤 데이터 생성
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          barPercentage: 0.8,
          categoryPercentage: 1.0,
        },
      ],
    });
  };

  return (
    <div style={{ width: '100%', height: '420px', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center',justifyContent: 'right' }}>
        <label htmlFor="day-select" style={{ marginRight: '10px' }}>날짜 선택:</label>
        <Form.Select
          aria-label="Select day"
          onChange={handleDayChange} // 핸들러 연결
          style={{ width: "150px", margin: "0" }}
        >
          <option value="">일 선택</option>
          {[...Array(31).keys()].map((i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}일
            </option>
          ))}
        </Form.Select>
      </div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default Chart1;
