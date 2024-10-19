import React, { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import "../css/Cctv.css";
import Swal from "sweetalert2";

const CCTV = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [splitView, setSplitView] = useState(false); // 화면 분할 상태 추가

  const cctvAddresses = [
    "http://localhost:8000/video_feed",
    "http://localhost:8000/video_feed",
    "http://localhost:8000/video_feed",
    "http://localhost:8000/video_feed",
  ];

  const alertData = [
    { name: "CCTV1", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:00:50" },
    { name: "CCTV2", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:05:00" },
    { name: "CCTV3", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:10:00" },
    { name: "CCTV4", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:15:00" },
    { name: "CCTV5", image: "img/hyo1.PNG", timestamp: "2024-10-16 18:20:00" },
  ];

  const videoUrl = cctvAddresses[0];

  const handleShowAlert = () => {
    setShowAlert(!showAlert);
    console.log("Alert Toggled: ", !showAlert); // 상태 확인을 위한 디버깅
  };

  const toggleSplitView = () => {
    setSplitView(!splitView); // 화면 분할 상태 변경
    console.log("Split View Toggled: ", !splitView);
  };

  // 두 기능을 합친 함수
  const handleCombinedAction = () => {
    handleShowAlert(); // 이상 감지 현황 창 토글
    toggleSplitView(); // 화면 분할 상태 토글
  };

  function alimClick() {
    Swal.bindClickHandler();
    Swal.fire({
      title: "흉기거수자 확인!!",
      text: "알림이 갔습니다.",
      imageUrl: "img/hyo1.PNG",
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: "Custom image",
      confirmButtonText: "트래킹모드",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.bindClickHandler();
        Swal.fire({
          width: "70%",
          title: "<strong>트래킹모드</strong>",
          html:
            "<h6>버튼을 클릭하면 꺼집니다.</h6>" +
            `<div className="tr-container">` +
            `<img src="${videoUrl}" alt="Video Stream" style="width: 80%; height: auto;"/>` +
            "</div>",
          focusConfirm: true,
          confirmButtonText: "확인",
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
        }).then((result) => {
          Swal.bindClickHandler();
          Swal.fire({
            title: "이미지 or 영상을 저장하시겠습니까?",
            imageUrl: "img/hyo1.PNG",
            imageWidth: 400,
            imageHeight: 200,
            imageAlt: "Custom image",
            showCancelButton: true,
            cancelButtonColor: "#d33",
            confirmButtonText: "확인",
            cancelButtonText: "취소",
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire("저장이 완료되었습니다.", "화끈하시네요~!", "success");
            } else {
              Swal.fire("종료합니다", "화끈하시네요~!", "success");
            }
          });
        });
      }
    });
  }

  return (
    <div className="main-content mt-5">
      <Container fluid className="mt-3 mb-3">
        <Row>
          <Col
            lg={6}
            md={12}
            sm={12}
            className="d-flex justify-content-left titles"
          >
            CCTV
          </Col>
          <Col lg={3} md={6} sm={6} className="text-lg-right text-md-left">
            <Button className="t2btns" onClick={() => alimClick()}>
              더보기
            </Button>
          </Col>
          <Col lg={3} md={6} sm={6} className="text-lg-right text-md-left">
            {/* 두 기능을 합친 버튼 */}
            <Button className="t2btns" onClick={handleCombinedAction}>
              {splitView ? "닫기" : "이상 감지 현황"}
            </Button>
          </Col>
        </Row>
      </Container>

      <div className={`main-container ${splitView ? "split-view" : ""}`}>
        {/* CCTV 화면 */}
        <Container
          fluid
          className={`cctv-container ${splitView ? "half-width" : ""}`}
        >
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
            <div
              className={`alert-items ${
                alertData.length >= 3 ? "scrollable" : ""
              }`}
            >
              {alertData.map((alert, index) => (
                <div className="alert-item" key={index}>
                  <img
                    src={alert.image}
                    alt="CCTV Image"
                    className="alert-image"
                  />
                  <div className="alert-details">
                    <div className="alert-info">
                      {/* 새로운 div로 묶기 */}
                      <span className="cctv-name">{alert.name}</span>
                      <Button className="alert-btn">흉기 의심</Button>
                    </div>
                  </div>
                  <span className="alert-timestamp">{alert.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CCTV;
