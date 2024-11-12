import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
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
      stacked: false,
      ticks: {
        align: 'center',
      },
    },
    y: {
      beginAtZero: true,
    },
  },
};

// 랜덤 데이터 생성 함수
// const generateRandomData = () => {
//   return Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));
// };


// 초기화 상태
const Chart1 = () => {
  const [selectedDay, setSelectedDay] = useState(1); // 선택된 날짜
  const [data, setData] = useState({
    labels: ['CCTV1', 'CCTV2', 'CCTV3', 'CCTV4'],
    datasets: [
      {
        label: '들어온 사람',
        data: [0,0,0,0], 
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 1.0,
      },
      {
        label: '나간 사람',
        data: [0,0,0,0], 
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 1.0,
      },
    ],
  });

  // // 날짜 선택 변경 핸들러
  // const handleDayChange = (event) => {
  //   const selectedDay = event.target.value;
  //   setSelectedDay(selectedDay);
  //   console.log(`Selected day: ${selectedDay}`);
  // };
  
  // WebSocket을 통해 실시간 데이터 수신
  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/count_stats");

    socket.onmessage = (event) => {
      const countStats = JSON.parse(event.data);
      console.log("Received countStats:", countStats);  // 수신된 데이터 로그 확인
      
      if (countStats.classwise_counts && countStats.classwise_counts.person) {
        setData((prevData) => ({
          ...prevData,
          datasets: [
            { ...prevData.datasets[0], data: [countStats.classwise_counts.person.IN, 0, 0, 0] },
            { ...prevData.datasets[1], data: [countStats.classwise_counts.person.OUT, 0, 0, 0] },
          ],
        }));
      } else {
        console.warn("Person data missing in countStats");
      }
    };

    socket.onerror = (error) => console.error("WebSocket error:", error);
    socket.onclose = () => console.log("WebSocket connection closed");

    return () => socket.close();
  }, []);

  return (
    <div style={{ width: '100%', height: '420px', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
        <label htmlFor="day-select" style={{ marginRight: '10px' }}>날짜 선택:</label>
        <Form.Select
          aria-label="Select day"
          // onChange={handleDayChange}
          value={selectedDay}
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