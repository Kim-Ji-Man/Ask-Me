import React, { useState } from "react";
import { Button, Col, Container, Row, Modal, Form } from "react-bootstrap";
import "../css/Cctv.css";
import Swal from "sweetalert2";

const CCTV = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null); // 선택된 감지 항목 상태
  const [adminComment, setAdminComment] = useState(""); // 관리자 소견 상태

  const cctvAddresses = [
    "http://localhost:8000/video_feed",
    "http://localhost:8000/video_feed",
    "http://localhost:8000/video_feed",
    "http://localhost:8000/video_feed",
  ];

  const alertData = [
    { seq : 0 ,name: "CCTV1", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:00:50" },
    { seq : 1 ,name: "CCTV2", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:05:00" },
    { seq : 2 ,name: "CCTV3", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:10:00" },
    { seq : 3 ,name: "CCTV4", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:15:00" },
    {seq : 4 , name: "CCTV5", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:20:00" },
  ];

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
    setModalShow(true); // 모달 표시
  };

  const handleCommentChange = (e) => {
    setAdminComment(e.target.value);
  };

  return (
    <div className="main-content mt-5">
      <Container fluid className="mt-3 mb-3">
        <Row>
          <Col lg={6} md={12} sm={12} className="d-flex justify-content-left titles">
            CCTV
          </Col>
          <Col lg={3} md={6} sm={6} className="text-lg-right text-md-left">
            <Button className="t2btns">더보기</Button>
          </Col>
          <Col lg={3} md={6} sm={6} className="text-lg-right text-md-left">
            <Button className="t2btns" onClick={handleCombinedAction}>
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
            <div className={`alert-items ${alertData.length >= 3 ? "scrollable" : ""}`}>
              {alertData.length === 0 ? (
                <div className="no-alert">오늘 이상 감지가 없습니다</div>
              ) : (
                alertData.map((alert, index) => (
                  <div className="alert-item" key={index} onClick={() => handleAlertClick(alert)}>
                    <img src={alert.image} alt="CCTV Image" className="alert-image" />
                    <div className="alert-details">
                      <div className="alert-info">
                        <span className="cctv-name">{alert.name}</span>
                        <Button className="alert-btn">흉기 의심</Button>
                      </div>
                    </div>
                    <span className="alert-timestamp">{alert.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 선택된 이미지 모달 */}
        <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>감지된 CCTV 이미지</Modal.Title>
          </Modal.Header>
          <Modal.Body className="cctvmodalerror_body">
            {selectedAlert && (
              <>
                <img src={selectedAlert.image} alt={selectedAlert.name} className="img-fluid" />
                {/* 세부 정보 테이블 */}
                <table className="table table-bordered mt-3">
                  <tbody>
                    <tr>
                      <th>역 이름</th>
                      <td>{selectedAlert.name}</td>
                    </tr>
                    <tr>
                      <th>발생 위치</th>
                      <td>6번 출구</td> {/* 임의로 추가된 정보 */}
                    </tr>
                    <tr>
                      <th>이상 행동</th>
                      <td>
                        <Form.Select aria-label="Default select example">
                          <option>종류 선택</option>
                          <option value="1">흉기 의심</option>
                          <option value="2">폭력 의심</option>
                          <option value="3">기타</option>
                        </Form.Select>
                      </td>
                    </tr>
                    <tr>
                      <th>감지 일시</th>
                      <td>{selectedAlert.timestamp}</td>
                    </tr>
                    <tr>
                      <th>담당자 소견</th>
                      <td>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={adminComment}
                          onChange={handleCommentChange}
                          placeholder="관리자 소견을 입력하세요"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="cctvmodalerror">
            <Button variant="secondary" onClick={() => setModalShow(false)}>
              닫기
            </Button>
            <Button variant="primary" onClick={() => Swal.fire("저장 완료", adminComment, "success")}>
              저장
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default CCTV;
