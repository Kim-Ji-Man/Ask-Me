import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from '../../axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import "../../css/MasterGender.css";

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 연령대 라벨
const ageLabels = ['10대', '20대', '30대', '40대', '50대 이상'];

// 나이 계산 함수
const calculateAgeGroups = (birthDates) => {
  const currentYear = new Date().getFullYear();
  
  const ageRanges = { '10대': 0, '20대': 0, '30대': 0, '40대': 0, '50대 이상': 0 };

  birthDates.forEach(birth => {
    let birthYear;

    // 생년월일이 yyMMdd 형식인지 확인하고 처리
    if (birth.length === 6) { 
      // yyMMdd 형식일 경우 처리
      const prefix = parseInt(birth.slice(0,2),10) > currentYear % 100 ? '19' : '20'; // 예: '90'은 '1990', '01'은 '2001'
      birthYear = parseInt(prefix + birth.slice(0,2),10);
    } else if (birth.length === 8) {
      // yyyyMMdd 형식일 경우 처리
      birthYear = parseInt(birth.slice(0,4),10);
    } else {
      console.error('Invalid birth format:', birth);
      return;
    }

    const age = currentYear - birthYear;

    if (age >= 10 && age < 20) {
      ageRanges['10대'] += 1;
    } else if (age >= 20 && age < 30) {
      ageRanges['20대'] += 1;
    } else if (age >= 30 && age < 40) {
      ageRanges['30대'] += 1;
    } else if (age >= 40 && age < 50) {
      ageRanges['40대'] += 1;
    } else if (age >= 50) {
      ageRanges['50대 이상'] += 1;
    }
    
    console.log(`Birth Year: ${birthYear}, Age: ${age}, Updated Age Ranges:`, ageRanges);
    
 });
  
 return Object.values(ageRanges); // Return array of counts for each range
};

const MasterGender = () => {
  const [selectedGender, setSelectedGender] = useState('man'); // 기본 성별 선택 ('man' or 'woman')
  const [ageData, setAgeData] = useState([]);

  useEffect(() => {
    // Fetch users from backend API
    axios.get('/Masterdashboard/usersgender')
    .then(response => {
      console.log(response.data); // 응답 데이터를 확인
      const users = response.data; // 배열이 직접 반환될 경우
      if (Array.isArray(users)) {
        const filteredUsers = users.filter(user => user.gender === selectedGender);
        console.log(filteredUsers); 
        const birthDates = filteredUsers.map(user => user.birth);
        setAgeData(calculateAgeGroups(birthDates));
      } else {
        console.error('Expected an array but got:', typeof users);
      }
    })
    .catch(error => console.error('Error fetching users:', error));
  }, [selectedGender]);

  // 차트 데이터 설정
  const data = {
    labels: ageLabels,
    datasets: [
      {
        label: `${selectedGender === 'man' ? '남성' : '여성'}`,
        data: ageData,
        backgroundColor: selectedGender === 'man' ? '#D1E9F6' : '#FFC6C6',
        borderColor: selectedGender === 'man' ? '#D1E9F6' : '#FFC6C6',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: '100%', height: '420px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {/* 성별 선택 버튼 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setSelectedGender('man')} 
            className={selectedGender === 'man' ? 'chart_button_selected' : 'chart_button'}
          >
            남성
          </button>
          <button 
            onClick={() => setSelectedGender('woman')} 
            className={selectedGender === 'woman' ? 'chart_button_selected' : 'chart_button'}
          >
            여성
          </button>
        </div>
      </div>

      <Bar data={data} options={{
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top" } }
      }} />
    </div>
  );
};

export default MasterGender;