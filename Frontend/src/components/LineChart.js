import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Form } from 'react-bootstrap'; // Bootstrap Form 가져오기

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 옵션 설정
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: '일별 통계 차트',
    },
    datalabels: {
      display: false, // 데이터 라벨 비활성화
    },
  },
};

// 각 월의 최대 일수를 설정
const daysInMonth = (month) => {
  switch (month) {
    case 1: return 31; // 1월
    case 2: return 28; // 2월 (비윤년 고정)
    case 3: return 31; // 3월
    case 4: return 30; // 4월
    case 5: return 31; // 5월
    case 6: return 30; // 6월
    case 7: return 31; // 7월
    case 8: return 31; // 8월
    case 9: return 30; // 9월
    case 10: return 31; // 10월
    case 11: return 30; // 11월
    case 12: return 31; // 12월
    default: return 0; // 잘못된 입력
  }
};

// 무작위 데이터 생성 함수
const generateRandomData = (length, min, max) => {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};

export default function MonthlyLineChart() {
  const [month, setMonth] = useState(""); // 선택한 월 저장
  const [data, setData] = useState({
    labels: Array.from({ length: 31 }, (_, i) => i + 1),
    datasets: [
      {
        label: '분류 1',
        type: 'bar',
        data: generateRandomData(31, 5, 30), // 5에서 30 사이의 무작위 데이터
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: '분류 2',
        type: 'line',
        data: generateRandomData(31, 10, 40), // 10에서 40 사이의 무작위 데이터
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  });

  const selectMonth = (value) => {
    setMonth(value);
    const monthIndex = parseInt(value); // 선택한 월을 숫자로 변환
    const days = daysInMonth(monthIndex); // 선택한 월의 일수 가져오기

    const newData = {
      labels: Array.from({ length: days }, (_, i) => i + 1), // 1일부터 해당 월의 일수까지의 레이블 생성
      datasets: [
        {
          label: '분류 1',
          type: 'bar',
          data: generateRandomData(days, 5, 30), // 해당 일수에 맞춰 데이터 생성
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: '분류 2',
          type: 'line',
          data: generateRandomData(days, 10, 40), // 해당 일수에 맞춰 데이터 생성
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    };
    setData(newData); // 새로운 데이터로 업데이트
  };

  return (
    <div style={{ padding: '20px' }}>
      <h5 className="text-center mb-4">월별 통계</h5>
      <Form.Select
        aria-label="Select month"
        onChange={(e) => selectMonth(e.target.value)}
        style={{ width: "150px", margin: "0 auto", display: "block" }}
      >
        <option value="">월 선택</option>
        {[...Array(12).keys()].map((i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}월
          </option>
        ))}
      </Form.Select>
      {month && (
        <h6 className="text-center mt-3">{month}월 흉기 검지 횟수</h6>
      )}
      <div style={{ width: '100%', height: '400px' }}>
        <Line options={options} data={data} />
      </div>
    </div>
  );
}
