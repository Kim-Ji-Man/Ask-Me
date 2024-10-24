import React, { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import "../../css/CombinedChart.css"

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 랜덤 데이터 생성 함수
const generateRandomData = () => {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));
};

// 흉기 감지와 오감지 데이터 생성
const weaponData = generateRandomData();
const noWeaponData = generateRandomData();

// 1월부터 12월까지의 라벨
const labels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const LineChart = () => {
  const chartRef = useRef(null);

  // 그라디언트 색상 적용
  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      const ctx = chart.ctx;
      
      const gradientWeapon = ctx.createLinearGradient(0, 0, 0, 400);
      gradientWeapon.addColorStop(0, 'rgba(255, 99, 132, 1)');
      gradientWeapon.addColorStop(1, 'rgba(255, 99, 132, 0.1)');

      const gradientNoWeapon = ctx.createLinearGradient(0, 0, 0, 400);
      gradientNoWeapon.addColorStop(0, 'rgba(54, 162, 235, 1)');
      gradientNoWeapon.addColorStop(1, 'rgba(54, 162, 235, 0.1)');

      // data.datasets[0].backgroundColor = gradientWeapon;
      // data.datasets[1].backgroundColor = gradientNoWeapon;
    }
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        // backgroundColor: 'rgba(0, 0, 0, 0.7)', // 툴팁 배경색
        bodyColor: '#fff', // 툴팁 텍스트 색
        titleFont: { size: 16 }, // 툴팁 제목 글꼴 크기
      },
    },
    scales: {
      y: {
        beginAtZero: true, // y축 최소값 0부터 시작
      },
    },
    elements: {
      point: {
        radius: 10, // 데이터 포인트의 크기
        backgroundColor: 'white', // 포인트의 색상
        borderColor: '#888', // 포인트의 테두리 색상
        borderWidth: 1, // 테두리 두께
      },
      line: {
        borderWidth: 2, // 라인 두께
        // tension: 0.4, // 곡선 부드럽게
      }
    }
  };

  const data = {
    labels,
    datasets: [
      {
        label: '흉기 감지',
        data: weaponData, // 흉기 감지 데이터
        borderColor: 'rgba(255, 99, 132, 1)',
        // backgroundColor: 'rgba(255, 99, 132, 0.1)',
        // fill: true,
      },
      {
        label: '오감지',
        data: noWeaponData, // 오감지 데이터
        borderColor: 'rgba(54, 162, 235, 1)',
        // backgroundColor: 'rgba(54, 162, 235, 0.1)',
        // fill: true,
      },
    ],
  };

  return (
    <div style={{ padding: '10px' }}>
      <h5 className="text-center mb-5 chart-title" style={{fontSize:'24px'}}>월별 흉기 감지 및 오감지 통계</h5>
      <div style={{ width: '100%', height: '420px', padding: '20px', boxSizing: 'border-box' }}>
        <Line data={data} options={options} ref={chartRef} />
      </div>
    </div>
  );
};

export default LineChart;
