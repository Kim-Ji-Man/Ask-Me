import React, { useState, useEffect } from "react";
import { Button, Col, Container, Row, Modal, Form } from "react-bootstrap";
import "../css/Cctv.css"; 
import Swal from "sweetalert2"; 
import webSocketService from '../websocketService';
import CctvWebSocket from"../components/CctvWebSocket"
import axios from "../axios";

const CCTV = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null); // 선택된 감지 항목 상태
  const [adminComment, setAdminComment] = useState(""); // 관리자 소견 상태
  const [anomalyType, setAnomalyType] = useState(""); 
  const [alertData, setAlertData] = useState([]); // 백엔드에서 가져온 이상 감지 
  const [filterType, setFilterType] = useState("today"); // New state for filtering
  
CctvWebSocket();

  const cctvAddresses = [
    "http://localhost:8000/video_feed1",
    "http://localhost:8000/video_feed2",
    "http://localhost:8000/video_feed1",
    "http://localhost:8000/video_feed2",
  ];

  const videoUrl = cctvAddresses[0];

  // const alertData = [
  //   { seq: 0, name: "CCTV1", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:00:50" },
  //   { seq: 1, name: "CCTV2", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:05:00" },
  //   { seq: 2, name: "CCTV3", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:10:00" },
  //   { seq: 3, name: "CCTV4", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:15:00" },
  //   { seq: 4, name: "CCTV5", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:20:00" },
  // ];

  const handleShowAlert = () => {
    setShowAlert(!showAlert);
  };

  const toggleSplitView = () => {
    setSplitView(!splitView);
  };

  const handleCombinedAction = () => {
    handleShowAlert();
    toggleSplitView();
  };

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert); // 선택된 항목 저장
    setAnomalyType(alert.anomaly_type); // 기존 이상 행동 설정
    setAdminComment(alert.comment || ""); // 기존 관리자 소견 설정 (없으면 빈 값)
    setModalShow(true); // 모달 표시
  };

  const handleCommentChange = (e) => {
    setAdminComment(e.target.value);
  };

  const handleAnomalyTypeChange = (e) => {
    setAnomalyType(e.target.value); // 이상 행동 선택 상태 업데이트
  };

    // API 호출하여 이상 감지 데이터를 가져오는 함수
    const fetchAlertData = async () => {
      try {
        const response = await axios.get('/Alim/cctvalims'); // 백엔드 API 호출
        setAlertData(response.data); // 응답 데이터를 alertData에 저장
      } catch (error) {
        console.error('Error fetching alert data:', error);
      }
    };

    const getFilteredAlerts = () => {
      if (filterType === "today") {
        const todayDate = new Date().toISOString().slice(0, 10);
        return alertData.filter(alert => new Date(alert.detection_time).toISOString().slice(0, 10) === todayDate);
      }
      return alertData;
    };
  
    // Handle button click to change filter
    const handleFilterChange = (type) => {
      setFilterType(type);
    };


    const handleSaveChanges = async () => {
      if (!selectedAlert) return;
    
      // Validation: Ensure a valid anomaly type is selected
      if (anomalyType === "흉기의심") {
        Swal.fire("저장 실패", "이상 행동을 선택하세요.", "warning");
        return;
      }
    
      if (!adminComment.trim()) {
        Swal.fire("저장 실패", "담당자 소견을 입력하세요.", "warning");
        return;
      }
    
      try {
        await axios.put(`/Alim/update-anomaly/${selectedAlert.id}`, {
          anomaly_type: anomalyType,
          admin_comment: adminComment,
        });
        Swal.fire("저장 완료", "이상 행동과 관리자 소견이 성공적으로 저장되었습니다.", "success");
        setModalShow(false); // Close the modal
        fetchAlertData(); // Refresh data after saving
      } catch (error) {
        console.error('Error updating anomaly:', error);
        Swal.fire("저장 실패", "저장하는 중 오류가 발생했습니다.", "error");
      }
    };

      // 컴포넌트가 마운트될 때 API 호출
  useEffect(() => {
    fetchAlertData();
  }, []);
  
  const sortedAlertData = alertData.sort((a, b) => {
    if (a.anomaly_type === "흉기의심" && b.anomaly_type !== "흉기의심") {
      return -1;
    }
    if (a.anomaly_type !== "흉기의심" && b.anomaly_type === "흉기의심") {
      return 1;
    }
    return 0;
  });
  
  

  return (
    <div className="main-content mt-5">
<Container fluid className="mt-3 mb-3">
  <Row className="d-flex justify-content-between align-items-center">
    <Col lg={6} md={6} sm={6} xs={6} className="titles">
      CCTV
    </Col>
    <Col lg={6} md={6} sm={6} xs={6} className="d-flex justify-content-end">
      <Button className="t2btnsa" onClick={handleCombinedAction}>
        {splitView ? "닫기" : "이상 감지 현황"}
      </Button>
    </Col>
  </Row>
</Container>

      <div className={`main-container ${splitView ? "split-view" : ""}`}>
        {/* CCTV 화면 */}
        <Container fluid className={`cctv-container ${splitView ? "half-width" : ""}`}>
          <Row className="g-4">
            {cctvAddresses.map((address, index) => (
              <Col md={6} lg={6} key={index}>
                <div className="video-container">
                  <div className="cctv-label">CCTV{index + 1}</div>
                  <img src={address} alt="Video Stream" />
                </div>
              </Col>
            ))}
          </Row>
        </Container>

  
        {/* 이상 감지 현황 */}
        {showAlert && (
          <div className={`alert-section ${splitView ? "half-width" : ""}`}>
            <h5 className="error_title">이상 감지 현황</h5>
            {/* Filter buttons */}
            <div className="filter-buttons">
            <Button
  style={{
    backgroundColor: filterType === "today" ? "#4681f4" : "transparent", // Blue when clicked, Red when not
    color: "black",
  }}
  onClick={() => handleFilterChange("today")}
>
  당일 보기
</Button>
<Button
  style={{
    backgroundColor: filterType === "all" ? "#4681f4" : "transparent", // Blue when clicked, Red when not
    color: "black",
  }}
  onClick={() => handleFilterChange("all")}
>
  전체 보기
</Button>
            </div>
            <div className={`alert-items ${getFilteredAlerts().length >= 3 ? "scrollable" : ""}`}>
              {getFilteredAlerts().length === 0 ? (
                <div className="no-alert">오늘 이상 감지가 없습니다</div>
              ) : (
                getFilteredAlerts().map((alert, index) => (
                  <div className="alert-item" key={index} onClick={() => handleAlertClick(alert)}>
                    <img src={`http://localhost:5000${alert.image_path}`} alt="CCTV Image" className="alert-image" />
                    <div className="alert-details">
                      <div className="alert-info">
                        <span className="cctv-name">{alert.device_name}</span>
                        <Button
                          className="alert-btn"
                          style={{
                            backgroundColor:
                              alert.anomaly_type === "흉기"
                                ? "red"
                                : alert.anomaly_type === "오류"
                                ? "orange"
                                : alert.anomaly_type === "기타"
                                ? "black"
                                : "gray",
                            color: "white",
                          }}
                        >
                          {alert.anomaly_type}
                        </Button>
                      </div>
                    </div>
                    <span className="alert-timestamp">{new Date(alert.detection_time).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {/* 선택된 이미지 모달 */}
        <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>이상내역</Modal.Title>
          </Modal.Header>
          <Modal.Body className="cctvmodalerror_body">
            {selectedAlert && (
              <>
                <img src={`http://localhost:5000${selectedAlert.image_path}`} alt={selectedAlert.device_name} className="img-fluid" />
                {/* 세부 정보 테이블 */}
                <table className="table table-bordered mt-3">
                  <tbody>
                    <tr>
                      <th>cctv이름</th>
                      <td>{selectedAlert.device_name}</td>
                    </tr>
                    <tr>
                      <th>발생 위치</th>
                      <td>{selectedAlert.location}</td> {/* 위치 정보 추가 */}
                    </tr>
                    <tr>
                      <th>이상 행동</th>
                      <Form.Select aria-label="Default select example" value={anomalyType} onChange={handleAnomalyTypeChange} style={{width:'100%'}}>
                          <option value="흉기의심">종류 선택</option> {/* 기본 옵션 */}
                          <option value="흉기">흉기</option> {/* 흉기 옵션 */}
                          <option value="오류">오류</option> {/* 오류 옵션 */}
                          <option value="기타">기타</option> {/* 기타 옵션 */}
                        </Form.Select>
                    </tr>
                    <tr>
                      <th>감지 일시</th>
                      <td>{new Date(selectedAlert.detection_time).toLocaleString()}</td> {/* 감지 일시 추가 */}
                    </tr>
                    <tr>
                      <th>담당자 소견</th>
                      <td>
                        <Form.Control as="textarea" rows={5} value={adminComment} onChange={handleCommentChange} placeholder="관리자 소견을 입력하세요" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </Modal.Body>

          {/* 모달 하단 버튼 */}
          <Modal.Footer className="cctvmodalerror">
            <Button variant="secondary" onClick={() => setModalShow(false)}>
              닫기
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              저장
            </Button>
          </Modal.Footer>
        </Modal>

      </div> {/* main-container 끝 */}
    </div> /* main-content 끝 */
  );
};

export default CCTV;
