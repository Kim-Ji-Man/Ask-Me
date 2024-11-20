import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from '../../axios'; 
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
      color: 'black', // 데이터 레이블 색상
      anchor: 'center',
      align: 'center',
      display: function(context) {
        // 데이터 값이 0이면 라벨을 표시하지 않음
        return context.dataset.data[context.dataIndex] !== 0;
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      ticks: {
        align: 'center',
      },
    },
    y: {
      beginAtZero: true,
      stacked: true,
    },
  },
};

// Helper 함수: 월별 데이터 초기화
const initializeMonthlyData = () => {
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const year = new Date().getFullYear(); // 현재 연도 사용
  const labels = months.map(month => `${year}-${month}`);
  
  return {
    labels,
    adminData: Array(12).fill(0),
    guardData: Array(12).fill(0),
    userData: Array(12).fill(0),
  };
};

const MasterJoin = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // 백엔드 API 호출하여 데이터 가져오기
    axios.get('/Masterdashboard/user-registration-stats') // 실제 API 엔드포인트로 변경 필요
      .then(response => {
        const apiData = response.data;
        
        // 초기화된 월별 데이터 생성
        const { labels, adminData, guardData, userData } = initializeMonthlyData();

        // 각 역할별로 데이터를 분류하고 해당 월에 맞게 카운팅
        apiData.forEach(item => {
          const monthIndex = new Date(item.created_at).getMonth(); // created_at에서 월 추출 (0부터 시작)
          if (item.role === 'admin') adminData[monthIndex]++;
          if (item.role === 'guard') guardData[monthIndex]++;
          if (item.role === 'user') userData[monthIndex]++;
        });

        // 차트 데이터 설정
        setData({
          labels,
          datasets: [
            {
              label: '관리자',
              data: adminData,
              backgroundColor: '#FF8C9E',
              borderColor: '#FF8C9E',
              borderWidth: 1,
            },
            {
              label: '경비원',
              data: guardData,
              backgroundColor: '#F6EACB',
              borderColor: '#F6EACB',
              borderWidth: 1,
            },
            {
              label: '일반 사용자',
              data: userData,
              backgroundColor: '#B9E5E8',
              borderColor: '#B9E5E8',
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(error => console.error('데이터 가져오기 실패:', error));
  }, []);

  return (
    <div className="chart-container">
      <h5 className="chart-title">월별 사용자 통계</h5>
      <Bar data={data} options={options} style={{ marginTop:'60px' }} />
    </div>
  );
};

export default MasterJoin;