import React, { useCallback, useEffect, useState } from "react";
import { Card, Col, Container,Row } from "react-bootstrap";
import "../css/MainMater.css";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // 아이콘 추가
import MasterAi from "../components/MainMaster/MasterAi";
import MasterJoin from "../components/MainMaster/MasterJoin";
import MasterGender from "../components/MainMaster/MasterGender";

const MainMaster = () => {
  const navigate = useNavigate();
  const navigateTo = useCallback(
    (path) => {
      navigate(path);
      localStorage.setItem("activeMenu", path);
    },
    [navigate]
  );

  const [month, setMonth] = useState("");
  const [num, setNum] = useState();

  // 상태 변수를 추가합니다.
  const [status, setStatus] = useState("정상"); // 기본 상태는 '정상'으로 설정
  const [isError, setIsError] = useState(false); // 오류 상태 변수
  const [data, setData] = useState({
    totalUsers: 0,
    dailyUsers: 0,
    totalNotifications: 0,
    dailyNotifications: 0,
  });

  // 상태 업데이트 함수
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get('/Masterdashboard/users');
        const notificationsResponse = await axios.get('/Masterdashboard/notifications');
        
        // 응답 데이터 구조 확인
        console.log('Users Response:', usersResponse);
        console.log('Notifications Response:', notificationsResponse);
        
        setData({
          totalUsers: usersResponse.data.totalUsers,
          dailyUsers: usersResponse.data.dailyUsers,
          totalNotifications: notificationsResponse.data.totalNotifications,
          dailyNotifications: notificationsResponse.data.dailyNotifications,
        });
  
        setStatus('정상');
        setIsError(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setStatus('오류');
        setIsError(true);
      }
    };
  
    fetchData();
  }, []);
  function selectMonth(value) {
    setMonth(value);
  }
  console.log(num, "됭");


  return (
    <div className="main-content mt-5">
      <Container fluid>
        <Row className="mt-3 mb-3">
          <Col md={6} lg={6} xs={6} className="d-flex justify-content-left titles">
            <div className="dashboard-title d-flex align-items-center">
              <h2 className="mb-0 me-2 titles">대시보드</h2>
            </div>
          </Col>
          <Col md={6} lg={6} xs={6}>
          <div className="status-card">
          {isError ? (
                <>
                  
                  <FaTimesCircle className="status-icon" style={{ color: "red" }} />
                  <div className="status-message">상태 : {status}</div>
                  <div className="tooltip-text">
                    오류 발생! 서버 연결이 실패했습니다. <br />
                    재시도 하거나 관리자에게 문의하세요.
                    <div className="tooltip-arrow"></div>
                  </div>
                </>
              ) : (
                <>
                  <FaCheckCircle
                    className="status-icon"
                    style={{ color: "lightgreen" }}
                  />
                  <div className="status-message">상태 : {status}</div>
                  <div className="tooltip-text">
                    시스템 상태가 정상입니다. <br />
                    대시보드에서 실시간 데이터를 확인하세요.
                    <div className="tooltip-arrow"></div>
                  </div>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
      <Container fluid className="dashboard">
        <Row className="justify-content-center">
          {[
            { label: '전체 가입자수', value: data.totalUsers },
            { label: '당일 가입자수', value: data.dailyUsers },
            { label: '전체 감지수', value: data.totalNotifications },
            { label: '당일 감지수', value: data.dailyNotifications },
          ].map((item, index) => (
            <Col xs={12} sm={6} md={3} key={index} className="mb-4">
              <Card className="text-center shadow-sm">
                <Card.Body>
                  <Card.Title>{item.label}</Card.Title>
                  <Card.Text className="value">{item.value}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      <Container fluid>
        <Row className="g-4 mb-5">
          <Col md={12} lg={12}>
            <div
              className="card p-4"
            >
              {/* 차트 컴포넌트 삽입 */}
              <div className="mt-4">
                  <MasterAi/>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="g-4">
          <Col md={6} lg={6}>
            <div className="card p-3" style={{ height: '550px'}}>
             <MasterJoin/>
            </div>
          </Col>
          <Col md={6} lg={6}>
            <div className="card p-3" style={{ height: '550px'}}>
              <h6 className="chart-title" style={{fontSize:'24px'}}>연령대별 성별 분석</h6>
                <MasterGender/>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainMaster;
