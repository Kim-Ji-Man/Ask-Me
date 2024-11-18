import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from '../../axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import "../../css/CombinedChart.css";

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = () => {
  const [chartData, setChartData] = useState(null);

  // 백엔드에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/Masterdashboard/one/Month`);
        const data = response.data;
        console.log(response.data,"월별 데이터");

        // 월별 라벨 생성 (1월 ~ 12월)
        const labels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

        // 흉기 감지 및 오감지 데이터 배열 생성
        const weaponData = new Array(12).fill(0);
        const noWeaponData = new Array(12).fill(0);

        data.forEach(item => {
          const monthIndex = item.month - 1; // 월은 배열 인덱스보다 하나 적음 (0부터 시작)
          weaponData[monthIndex] = item.weapon_count;
          noWeaponData[monthIndex] = item.no_weapon_count;
        });

        setChartData({
          labels,
          datasets: [
            {
              label: '흉기 감지',
              data: weaponData,
              borderColor: 'rgba(255, 99, 132, 1)', // 라인 색상
              // backgroundColor: 'rgba(255, 99, 132, 0.2)', // 라인 아래 그라디언트 색상
              // fill: true,
              tension: 0.4, // 곡선 부드럽게
              // pointBackgroundColor: 'rgba(255, 99, 132, 1)', // 포인트 색상
              pointBorderColor: 'rgba(255, 99, 132, 1)',
              pointRadius: 12,
            },
            {
              label: '오감지',
              data: noWeaponData,
              borderColor: 'rgba(54, 162, 235, 1)', // 라인 색상
              // backgroundColor: 'rgba(54, 162, 235, 0.2)', // 라인 아래 그라디언트 색상
              // fill: true,
              tension: 0.4,
              // pointBackgroundColor: 'rgba(54, 162, 235, 1)', // 포인트 색상
              pointBorderColor: 'rgba(54, 162, 235, 1)',
              pointRadius: 12,
            },
          ],
        });
      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
      }
    };

    fetchData();
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
      y: { beginAtZero: true }, // y축 최소값을 0으로 설정
      x: { grid: { display: false } } // x축의 그리드 라인을 숨김
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

  return (
    <div style={{ padding: '10px' }}>
      <h5 className="text-center mb-5 chart-title" style={{ fontSize:'24px' }}>월별 흉기 감지 및 오감지 통계</h5>
      <div style={{ width: '100%', height: '420px', padding: '20px', boxSizing:'border-box' }}>
        {chartData ? <Line data={chartData} options={options} /> : <p>데이터 로딩 중...</p>}
      </div>
    </div>
  );
};

export default LineChart;
