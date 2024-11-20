import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Form } from 'react-bootstrap';
import axios from '../axios';
import "../css/CombinedChart.css";

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
      stacked: true,
    },
    y: {
      stacked: true,
      ticks: {
        beginAtZero: true, // Y축이 0부터 시작하도록 설정
      },
    },
  },
};

const CombinedChart = () => {
  const currentMonth = new Date().getMonth() + 1;
  
  // 상태 관리
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); 
  const [showMorning, setShowMorning] = useState(true); 
  const [selectedButton, setSelectedButton] = useState("morning");
  
  // 데이터 상태 관리
  const [peopleData, setPeopleData] = useState({ entry: [], exit: [] });

  // 월 변경 핸들러
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // 오전/오후 버튼 클릭 핸들러
  const handleMorningClick = () => {
    setShowMorning(true);
    setSelectedButton("morning");
  };

  const handleAfternoonClick = () => {
    setShowMorning(false);
    setSelectedButton("afternoon");
  };

  // 데이터 불러오기 함수
  const fetchDataForMonth = async (month) => {
    try {
      // 들어온 사람/나간 사람 데이터 가져오기
      const peopleResponse = await axios.get(`/Masterdashboard/people/${month}`);
      
      // 서버에서 반환된 데이터를 로그로 확인
      console.log('People Response:', peopleResponse.data);
  
      // 응답 데이터가 배열인지 확인하고 처리
      const entryData = Array(24).fill(0); // 모든 시간을 기본값으로 설정
      const exitData = Array(24).fill(0); 
  
      // 들어온 사람과 나간 사람 데이터 처리 (누락된 시간은 기본값 0)
      if (Array.isArray(peopleResponse.data)) {
        peopleResponse.data.forEach((item) => {
          entryData[item.hour] = item.total_in;
          exitData[item.hour] = item.total_out;
        });
      } else {
        console.error("People data is not an array:", peopleResponse.data);
      }
  
      // 통합된 데이터를 상태로 설정
      setPeopleData({
        entry: entryData,
        exit: exitData,
      });
  
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
    }
  };
  
  // 선택된 월이 변경될 때마다 데이터 불러오기
  useEffect(() => {
    fetchDataForMonth(selectedMonth);
  }, [selectedMonth]);

  
  // 오전/오후 라벨 설정
  const currentLabels = showMorning ? morningLabels : afternoonLabels;

  
  // 오전/오후에 따라 데이터 슬라이싱
  const currentDataSliceStartIndex = showMorning ? 0 : 12;

// 차트 데이터 설정
const dataForChartDisplay = {
  labels: currentLabels,
  datasets: [
    {
      label: '들어온 사람',
      data: peopleData.entry.slice(currentDataSliceStartIndex, currentDataSliceStartIndex + 12),
      backgroundColor: '#7AB2D3',
    },
    {
      label: '나간 사람',
      data: peopleData.exit.slice(currentDataSliceStartIndex, currentDataSliceStartIndex + 12),
      backgroundColor: '#B9E5E8',
    },
  ],
};

return (
    <div style={{ padding:'10px' }}>
        <h5 className="text-center mb-5" style={{ fontSize:'24px' }}>월 시간별 출입 통계</h5>
        <div style={{ display:'flex', justifyContent:'right', gap:'10px', marginTop:'20px' }}>
            <Form.Select aria-label="Select month" onChange={handleMonthChange} value={selectedMonth} style={{ width:"150px", margin:"0", display:"block" }}>
                <option value="">월 선택</option>
                {[...Array(12).keys()].map((i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}월</option>
                ))}
            </Form.Select>
            <button onClick={handleMorningClick} className={selectedButton === "morning" ? "chart_buttons_selected" : "chart_buttons"}>오전</button>
            <button onClick={handleAfternoonClick} className={selectedButton === "afternoon" ? "chart_buttons_selected" : "chart_buttons2"}>오후</button>
        </div>

        <div style={{ width:'100%', height:'420px', padding:'20px', boxSizing:'border-box' }}>
            <Bar data={dataForChartDisplay} options={options} />
        </div>
    </div>
);
};

export default CombinedChart;