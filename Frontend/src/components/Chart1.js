import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from '../axios';
import { Form } from 'react-bootstrap';

// 윤년 여부를 확인하는 함수
const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

// 월별 일수를 반환하는 함수 (한국 기준)
const getDaysInMonth = (year, month) => {
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonth[month - 1];
};

const Chart1 = () => {
    const currentYear = new Date().getFullYear(); // 현재 연도 계산
    const [selectedYear] = useState(currentYear); // 기본값: 현재 연도
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 기본값: 현재 월 (1월이 0이므로 +1)
    const [selectedDay, setSelectedDay] = useState(new Date().getDate()); // 기본값: 현재 일

    const [data, setData] = useState({
        labels: ['CCTV1'], // 공통 레이블 설정 (예: CCTV 또는 날짜)
        datasets: [
            {
                label: '들어온 사람',
                data: [0], // 들어온 사람 데이터 초기값
                backgroundColor: 'rgba(75,192,192,0.6)',
                borderColor: 'rgba(75,192,192)',
                borderWidth:1,
            },
            {
                label: '나간 사람',
                data: [0], // 나간 사람 데이터 초기값
                backgroundColor: 'rgba(255,99,132,.6)',
                borderColor: 'rgba(255,99,132)',
                borderWidth:1,
            }
        ]
    });

    // 선택된 연도와 월에 맞는 일수 계산
    const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonth);

    // 선택된 월과 일이 변경될 때마다 데이터를 가져오는 함수
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(`/Masterdashboard/admin/people-count/${selectedYear}/${selectedMonth}/${selectedDay}`);
          const chartData = response.data;
          console.log(chartData,"차트데이타 일별");
          
          setData({
            labels: ['CCTV1'], // 공통 레이블 설정 (예: CCTV 또는 날짜)
            datasets: [
              { 
                label: '들어온 사람', 
                data: [chartData.total_in || 0], // 들어온 사람 데이터 설정
                backgroundColor: '#7AB2D3', 
                borderColor: '#7AB2D3',
                borderWidth:1,
              },
              { 
                label: '나간 사람', 
                data: [chartData.total_out || 0], // 나간 사람 데이터 설정
                backgroundColor: '#B9E5E8', 
                borderColor: '#B9E5E8',
                borderWidth:1,
              },
            ],
          });
        } catch (error) {
          console.error('데이터를 가져오는 중 오류 발생:', error);
        }
      };

      fetchData();
    }, [selectedYear, selectedMonth, selectedDay]);

    // 차트 옵션 추가 (responsive 및 maintainAspectRatio 설정)
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    };

    return (
        <div style={{ width: '100%', height: '420px', padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>

              {/* 월 선택 */}
              <label htmlFor="month-select" style={{ marginRight: '10px' }}>월 선택:</label>
              <Form.Select
                aria-label="Select month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ width: "150px", marginRight: "10px" }}
              >
                {[...Array(12).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}월
                  </option>
                ))}
              </Form.Select>

              {/* 일 선택 */}
              <label htmlFor="day-select" style={{ marginRight: '10px' }}>일 선택:</label>
              <Form.Select
                aria-label="Select day"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                style={{ width: "150px", marginRight: "10px" }}
              >
                {[...Array(daysInSelectedMonth).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}일
                  </option>
                ))}
              </Form.Select>

            </div>

            {/* Bar 차트 */}
            <Bar data={data} options={options} />
        </div>
    );
};

export default Chart1;