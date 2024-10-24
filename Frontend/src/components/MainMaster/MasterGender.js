import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import "../../css/MasterGender.css";

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 랜덤 데이터 생성 함수
const generateRandomData = () => {
  return Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
};

// 연령대 라벨
const ageLabels = ['10대', '20대', '30대', '40대', '50대 이상'];

const options = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

const MasterGender = () => {
  const [selectedGender, setSelectedGender] = useState('male'); // 기본 성별 선택

  // 성별에 따른 데이터 생성
  const data = {
    labels: ageLabels,
    datasets: [
      {
        label: `${selectedGender === 'male' ? '남성' : '여성'}`,
        data: generateRandomData(),
        backgroundColor: selectedGender === 'male' ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
        borderColor: selectedGender === 'male' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: '100%', height: '420px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center',  justifyContent: 'flex-end' }}>
        {/* 성별 선택 버튼 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setSelectedGender('male')}
            className={selectedGender === 'male' ? 'chart_button_selected' : 'chart_button'}
          >
            남성
          </button>
          <button
            onClick={() => setSelectedGender('female')}
            className={selectedGender === 'female' ? 'chart_button_selected' : 'chart_button'}
          >
            여성
          </button>
        </div>
      </div>

      <Bar data={data} options={options} />
    </div>
  );
};

export default MasterGender;
