import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Form } from 'react-bootstrap';
import "../css/CombinedChart.css"

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 랜덤 데이터 생성 함수
const generateRandomData = () => {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));
};

// 월별 데이터셋 생성 (흉기, 들어온 사람, 나간 사람 데이터)
const dataSets = {};
for (let month = 1; month <= 12; month++) {
  dataSets[month] = {
    morning: {
      weapons: generateRandomData(),
      arrivals: generateRandomData(),
      dropouts: generateRandomData(),
    },
    afternoon: {
      weapons: generateRandomData(),
      arrivals: generateRandomData(),
      dropouts: generateRandomData(),
    },
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
  },
  scales: {
    x: {
      stacked: true, // x축 스택형 설정
    },
    y: {
      stacked: true, // y축 스택형 설정
    //   min: 0, // y축 최소값
    //   max: 100, // y축 최대값
    },
  },
};

const CombinedChart = () => {
  const [selectedMonth, setSelectedMonth] = useState(""); // 선택한 월
  const [showMorning, setShowMorning] = useState(true); // 오전/오후 선택
  const [selectedButton, setSelectedButton] = useState("morning"); // 선택된 버튼 상태
  
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleMorningClick = () => {
    setShowMorning(true); // 오전 데이터 표시
    setSelectedButton("morning"); // 오전 버튼 선택
  };

  const handleAfternoonClick = () => {
    setShowMorning(false); // 오후 데이터 표시
    setSelectedButton("afternoon"); // 오후 버튼 선택
  };

  const currentLabels = showMorning ? morningLabels : afternoonLabels;

  // 데이터셋 선택
  const currentData = selectedMonth 
    ? (showMorning ? dataSets[selectedMonth].morning : dataSets[selectedMonth].afternoon) 
    : { weapons: [], arrivals: [], dropouts: [] };

  const data = {
    labels: currentLabels,
    datasets: [
      {
        label: '흉기',
        data: currentData.weapons, // 오전/오후에 따라 데이터 설정
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: '들어온 사람',
        data: currentData.arrivals, // 오전/오후에 따라 데이터 설정
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: '나간 사람',
        data: currentData.dropouts, // 오전/오후에 따라 데이터 설정
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div style={{ padding: '10px' }}>
      <h5 className="text-center mb-5" style={{fontSize:'24px'}}>월 시간별 통계</h5>
      <div style={{ display: 'flex', justifyContent: 'right', gap: '10px', marginTop: '20px' }}>
        <Form.Select
          aria-label="Select month"
          onChange={handleMonthChange}
          style={{ width: "150px", margin: "0", display: "block" }}
        >
          <option value="">월 선택</option>
          {[...Array(12).keys()].map((i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}월
            </option>
          ))}
        </Form.Select>
        <button
          onClick={handleMorningClick}
          className={selectedButton === "morning" ? 'chart_buttons_selected' : 'chart_buttons'}
        >
          오전
        </button>
        <button
          onClick={handleAfternoonClick}
          className={selectedButton === "afternoon" ? 'chart_buttons_selected' : 'chart_buttons2'}
        >
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
