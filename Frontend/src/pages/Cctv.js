import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import "../css/Cctv.css";
import Swal from "sweetalert2";

const CCTV = () => {
  const cctvAddresses = [
    "http://localhost:8000/video_feed",
    // "http://192.168.70.185:8000/video_feed",
    // "http://192.168.70.213:8000/video_feed",
    // "http://192.168.70.113:8000/video_feed",

  ];

  const videoUrl = cctvAddresses[0];

  function alimClick() {

    Swal.bindClickHandler();
    Swal.fire({
      title: '흉기거수자 확인!!',
      text: '알림이 갔습니다.',
      imageUrl: 'img/hyo1.PNG',
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: 'Custom image',
      confirmButtonText: '트래킹모드',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    }).then(result => {
      if (result.isConfirmed) {
        Swal.bindClickHandler();
        Swal.fire({
          width: '70%',
          title: '<strong>트래킹모드</strong>',
          html:
            '<h6>버튼을 클릭하면 꺼집니다.</h6>' +
            ' <div className="tr-container">' +
             `<img src="${videoUrl}" alt="Video Stream" style="width: 80%; height: auto;"/>` +
            '</div>',
          focusConfirm: true,
          confirmButtonText: '확인',
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false
        }).then(result => {
          Swal.bindClickHandler();
          Swal.fire({
            title: '이미지 or 영상을 저장하시겠습니까?',
            imageUrl: 'img/hyo1.PNG',
            imageWidth: 400,
            imageHeight: 200,
            imageAlt: 'Custom image',
            showCancelButton: true,
            cancelButtonColor: '#d33',
            confirmButtonText: '확인',
            cancelButtonText: '취소',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false
          }).then(result => {
            if (result.isConfirmed) {
              Swal.fire('저장이 완료되었습니다.', '화끈하시네요~!', 'success');
            } else {
              Swal.fire('종료합니다', '화끈하시네요~!', 'success');
            }
          });
        });
      }
    });
  }

  return (
    <div className="main-content mt-5">
      <Container fluid className='mt-3 mb-3'>
        <Row>
          <Col lg={6} md={12} sm={12} className='d-flex justify-content-left titles'>
            CCTV
          </Col>
          <Col lg={6} md={12} sm={12} className="text-lg-right text-md-left">
            <Button className="t2btn" onClick={() => alimClick()}>
              더보기
            </Button>
          </Col>
        </Row>
      </Container>
      <Container fluid>
        <Row className="g-4">
          {cctvAddresses.map((address, index) => (
            <Col md={6} lg={6} key={index}>
              <div className="card p-3">
                <h6 style={{ backgroundColor: 'black', fontWeight: 'bold', color: "white", fontSize: "20px" }}>CCTV{index + 1}</h6>
                <div className="video-container">
                  <img src={address} alt="Video Stream" />
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default CCTV;
