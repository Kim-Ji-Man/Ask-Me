import React, { useCallback, useEffect, useState } from "react";
import { Col, Container,Row } from "react-bootstrap";
import "../css/Main.css";
import Barchart from "../components/Barch";
import LineChart from "../components/LineChart";
import PieChart from "../components/PieChart";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // 아이콘 추가
import News from "../components/News";
import CombinedChart from "../components/CombinedChart";
import Chart1 from "../components/Chart1";

const Main = () => {
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

  // 상태 업데이트 함수
  useEffect(() => {
    axios
      .get("/") // 데이터 요청
      .then((res) => {
        // 요청 성공 시 정상으로 설정
        setStatus("정상");
        setIsError(false);
      })
      .catch(() => {
        // 요청 실패 시 오류로 설정
        setStatus("오류");
        setIsError(true);
        console.log("서버 연결 실패");
      });
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
      <Container fluid>
        <Row className="g-4 mb-5">
          <Col md={12} lg={12}>
            <div
              className="card p-4"
            >
              {/* 차트 컴포넌트 삽입 */}
              <div className="mt-4">
                  <CombinedChart/>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="g-4">
          <Col md={6} lg={6}>
            <div className="card p-3" style={{ height: '500px'}}>
              <h6 style={{fontSize:'24px'}}>cctv 통계</h6>
              {/* <Barchart /> */}
              <Chart1/>
            </div>
          </Col>
          <Col md={6} lg={6}>
            <div className="card p-3" style={{ height: '500px'}}>
              <h6 style={{fontSize:'24px'}}>알림결과 및 조치</h6>
              <PieChart />
            </div>
          </Col>
        </Row>
        {/* <Row className="g-4 mt-3">
          <Col md={6} lg={6} >
            <div className="card p-3">
            
              <News/>
            </div>
          </Col>
          <Col md={6} lg={6} >
            <div className="card p-3">
          
            </div>
          </Col>
        </Row> */}
      </Container>
    </div>
  );
};

export default Main;
