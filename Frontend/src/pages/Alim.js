import React, { useState } from 'react';
import { Button, Col, Container, Image, Row, Modal } from 'react-bootstrap';
import PaginatedSearch from '../components/PaginatedSearch';
import { CSVLink } from 'react-csv';

const Alim = () => {
  const [show, setShow] = useState(false);
  const [modalImage, setModalImage] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = (img) => {
    setModalImage(img);
    setShow(true);
  };

  const datass = [
    {
      alim_seq: 1,
      alim_at: '2024-10-01 18:30:00',
      alim_title: '흉기관측',
      alim_cctv: 'cctv1',
      alim_stauts: '정상',
      alim_img: 'img/hyo1.PNG',
    },
    {
      alim_seq: 2,
      alim_at: '2024-10-01 12:30:00',
      alim_title: '흉기관측',
      alim_cctv: 'cctv3',
      alim_stauts: '오류',
      alim_img: 'img/hyo1.PNG',
    },
    {
      alim_seq: 3,
      alim_at: '2024-10-01 15:30:00',
      alim_title: '흉기관측',
      alim_cctv: 'cctv4',
      alim_stauts: '정상',
      alim_img: 'img/hyo1.PNG',
    },
    {
      alim_seq: 4,
      alim_at: '2024-10-02 10:30:00',
      alim_title: '흉기관측',
      alim_cctv: 'cctv2',
      alim_stauts: '정상',
      alim_img: 'img/hyo1.PNG',
    },
    {
      alim_seq: 5,
      alim_at: '2024-10-01 10:30:00',
      alim_title: '흉기관측',
      alim_cctv: 'cctv1',
      alim_stauts: '정상',
      alim_img: 'img/hyo1.PNG',
    },
    {
      alim_seq: 6,
      alim_at: '2024-10-01 16:30:00',
      alim_title: '흉기관측',
      alim_cctv: 'cctv1',
      alim_stauts: '정상',
      alim_img: 'img/hyo1.PNG',
    },
  ];

  const csvData = datass.map((alim, cnt) => ({
    순서: cnt + 1,
    알림명: alim.alim_title,
    CCTV: alim.alim_cctv,
    날짜: alim.alim_at.substring(0, 16),
    이미지: alim.alim_img,
    상태: alim.alim_stauts,
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
          <div className="card p-3">
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
              data={datass.map((alim, cnt) => ({
                index: cnt + 1,
                alim_seq: alim.alim_seq,
                alim_at: alim.alim_at.substring(0, 16),
                alim_title: alim.alim_title,
                alim_cctv: alim.alim_cctv,
                alim_img: alim.alim_img,
                alim_stauts: alim.alim_stauts,
              }))}
              columns={[
                { accessor: 'index', Header: '순서' },
                { accessor: 'alim_title', Header: '알림명' },
                { accessor: 'alim_cctv', Header: 'CCTV' },
                { accessor: 'alim_at', Header: '날짜' },
                {
                  accessor: 'alim_img',
                  Header: '이미지',
                  Cell: ({ row }) => (
                    <Image
                      src={row.values.alim_img}
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
                          row.values.alim_stauts === '정상'
                            ? '#BAF2E5'
                            : '#FFC5C5',
                        color:
                          row.values.alim_stauts === '정상'
                            ? '#008767'
                            : 'red',
                        border:
                          row.values.alim_stauts === '정상'
                            ? '#16C098'
                            : '#FFC5C5',
                      }}
                    >
                      {row.values.alim_stauts}
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
          <Image src={modalImage} fluid />
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
