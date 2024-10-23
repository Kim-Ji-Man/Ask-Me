import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Form } from 'react-bootstrap'; // Bootstrap Form 가져오기

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 랜덤 데이터 생성 함수
const generateRandomData = () => {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));
};

// 월별 데이터셋 생성 (시간대별 데이터)
const dataSets = {};
for (let month = 1; month <= 12; month++) {
  dataSets[month] = {
    morning: generateRandomData(),
    afternoon: generateRandomData(),
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
      text: '월별 시간대별 통계 차트',
    },
  },
};

const CombinedChart = () => {
  const [selectedMonth, setSelectedMonth] = useState(""); // 선택한 월
  const [showMorning, setShowMorning] = useState(true); // 오전/오후 선택

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleMorningClick = () => {
    setShowMorning(true); // 오전 데이터 표시
  };

  const handleAfternoonClick = () => {
    setShowMorning(false); // 오후 데이터 표시
  };

  const currentData =
    selectedMonth
      ? showMorning
        ? dataSets[selectedMonth].morning
        : dataSets[selectedMonth].afternoon
      : [];

  const currentLabels = showMorning ? morningLabels : afternoonLabels;

  const data = {
    labels: currentLabels,
    datasets: [
      {
        label: showMorning ? '오전' : '오후',
        data: currentData,
        backgroundColor: showMorning
          ? 'rgba(75, 192, 192, 0.6)'
          : 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <div style={{ padding: '20px' }}>
      <h5 className="text-center mb-4">월별 시간대별 통계</h5>

      <Form.Select
        aria-label="Select month"
        onChange={handleMonthChange}
        style={{ width: "150px", margin: "0 auto", display: "block" }}
      >
        <option value="">월 선택</option>
        {[...Array(12).keys()].map((i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}월
          </option>
        ))}
      </Form.Select>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
        <button onClick={handleMorningClick} className='chart_button'>
          오전
        </button>
        <button onClick={handleAfternoonClick} className='chart_button2'>
          오후
        </button>
      </div>

      <div style={{ width: '100%', height: '420px', padding: '20px', boxSizing: 'border-box' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default CombinedChart;
