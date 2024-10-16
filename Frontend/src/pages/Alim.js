import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Image, Row, Modal } from 'react-bootstrap';
import PaginatedSearch from '../components/PaginatedSearch';
import { CSVLink } from 'react-csv';
import "../css/Alim.css"
import axios from '../axios';

const Alim = () => {
  const [show, setShow] = useState(false);
  const [modalImage, setModalImage] = useState('');

  const [alims, setAlims] = useState([]);
  useEffect(() => {
    axios
      .get("/Alim") // 데이터 요청
      .then((res) => {
        setAlims(res.data)
        console.log(res.data);
      })
      .catch(() => {
        console.log("서버 연결 실패");
      });
  }, []);



  const handleClose = () => setShow(false);
  const handleShow = (img) => {
    setModalImage(img);
    setShow(true);
  };


  console.log(modalImage,"이미지 경로");
  
  const csvData = alims.map((alim, cnt) => ({
    순서: cnt + 1,
    알림명: alim.message,
    CCTV: alim.device_name,
    날짜:new Date(alim.sent_at).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    이미지: alim.image_url,
    상태: alim.status,
  }));

  return (
    <div className="main-content mt-5">
      <Container fluid>
        <Row className="mt-3 mb-3">
          <Col className="d-flex justify-content-left titles">알림내역</Col>
        </Row>
      </Container>
      <Container fluid>
        <Row>
          <Col >
          <div className="carda p-3">
          <CSVLink
                data={csvData}
                filename="알림내역.csv"
                className=" mb-3 d-flex justify-content-end"
                target="_blank"
              >
                <Button
                className="t2btns "
                >
                CSV 다운로드
                </Button>
                
              </CSVLink>
            <PaginatedSearch
              data={alims.map((alim, cnt) => ({
                index: cnt + 1,
                alim_seq: alim.noti_id ,
               alim_at: new Date(alim.sent_at).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                alim_title: alim.message,
                alim_cctv: alim.device_name,
                alim_img: alim.image_url,
                alim_stauts: alim.status,
              }))}
              columns={[
                { accessor: 'index', Header: '순서' },
                { accessor: 'alim_title', Header: '알림명' },
                { accessor: 'alim_cctv', Header: 'CCTV'},
                { accessor: 'alim_at', Header: '날짜' },
                {
                  accessor: 'alim_img',
                  Header: '이미지',
                  Cell: ({ row }) => (
                    <Image
                      src={`http://localhost:5000${row.values.alim_img}`}
                      width={'50%'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleShow(row.values.alim_img)}
                    />
                  ),
                },
                {
                  accessor: 'alim_stauts',
                  Header: '상태',
                  Cell: ({ row }) => (
                    <Button
                      style={{
                        backgroundColor:
                          row.values.alim_stauts === 'success'
                            ? '#BAF2E5'
                            : '#FFC5C5',
                        color:
                          row.values.alim_stauts === 'success'
                            ? '#008767'
                            : 'red',
                        border:
                          row.values.alim_stauts === 'success'
                            ? '#16C098'
                            : '#FFC5C5',
                      }}
                    >
                      {row.values.alim_stauts === 'success' ? "정상" : "오류"}
                    </Button>
                  ),
                },
              ]}
            />
            </div>
          </Col>
        </Row>
      </Container>

      {/* 이미지 확대 모달 */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>이미지 확대</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Image src={`http://localhost:5000${modalImage}`} fluid />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Alim;
