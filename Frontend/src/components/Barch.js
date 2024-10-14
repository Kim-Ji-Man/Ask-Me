// Barchart.js
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 랜덤 데이터 생성 함수
const generateRandomData = () => {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));
};

// 데이터셋 생성
const dataSets = {};
for (let day = 1; day <= 31; day++) {
  const dayKey = day.toString().padStart(2, '0');
  dataSets[dayKey] = {
    morning: generateRandomData(),   // 랜덤 오전 데이터
    afternoon: generateRandomData(), // 랜덤 오후 데이터
  };
}

const morningLabels = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
];

const afternoonLabels = [
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      // text: '시간별 (오전/오후)',
    },
  },
};

const Barchart = () => {
  const [selectedDate, setSelectedDate] = useState('10'); // 기본 선택 날짜
  const [showMorning, setShowMorning] = useState(true); // 오전/오후 표시 여부

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleToggle = () => {
    setShowMorning(!showMorning); // 오전/오후 토글
  };

  // 현재 선택된 날짜를 기준으로 데이터 가져오기
  const currentDateKey = selectedDate.padStart(2, '0');
  const currentData = showMorning ? dataSets[currentDateKey].morning : dataSets[currentDateKey].afternoon;
  const currentLabels = showMorning ? morningLabels : afternoonLabels;

  const data = {
    labels: currentLabels,
    datasets: [
      {
        label: showMorning ? '오전' : '오후',
        data: currentData,
        backgroundColor: showMorning ? 'rgba(75, 192, 192, 0.6)' : 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <div style={{ width: '100%', height: '420px', padding: '20px', boxSizing: 'border-box' }}>
      <select
        onChange={handleDateChange}
        value={selectedDate}
        style={{
          padding: '10px',
          marginRight: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          fontSize: '16px',
        }}
      >
        {Array.from({ length: 31 }, (_, i) => (
          <option key={i} value={i + 1}>
            {i + 1}일
          </option>
        ))}
      </select>
      <button
        onClick={handleToggle}
        style={{
          padding: '10px 15px',
          backgroundColor: showMorning ? 'rgba(75, 192, 192, 0.6)' : 'rgba(153, 102, 255, 0.6)', // 그래프 색깔에 맞게 변경
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'background-color 0.3s',
        }}
      >
        {showMorning ? '오전' : '오후'}
      </button>
      <Bar data={data} options={options} />
    </div>
  );
};

export default Barchart;
