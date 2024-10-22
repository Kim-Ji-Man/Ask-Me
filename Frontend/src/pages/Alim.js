import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Modal, Form } from 'react-bootstrap';
import axios from '../axios';
import "../css/Alim.css";
import { BsDownload, BsThreeDots } from 'react-icons/bs';

const Alim = () => {
  const [show, setShow] = useState(false);
  const [selectedAlim, setSelectedAlim] = useState(null);
  const [alims, setAlims] = useState([]);
  const [filteredAlims, setFilteredAlims] = useState([]);
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios
      .get("/Alim")
      .then((res) => {
        setAlims(res.data);
        setFilteredAlims(res.data);
        console.log(res.data);
      })
      .catch(() => {
        console.log("서버 연결 실패");
      });
  }, []);

  const handleClose = () => setShow(false);
  
  const handleShow = (alim) => {
    setSelectedAlim(alim);
    setShow(true);
  };

  useEffect(() => {
    const normalizedSearchTerm = searchTerm.replace(/\s+/g, '').toLowerCase();
    const filtered = alims.filter((alim) => {
      const messageMatch = alim.message.replace(/\s+/g, '').toLowerCase().includes(normalizedSearchTerm);
      const deviceNameMatch = alim.device_name.replace(/\s+/g, '').toLowerCase().includes(normalizedSearchTerm);
      const dateMatch = new Date(alim.sent_at).toLocaleString('ko-KR').replace(/\s+/g, '').includes(normalizedSearchTerm);
      return messageMatch || deviceNameMatch || dateMatch;
    });
    setFilteredAlims(filtered);
  }, [searchTerm, alims]);

  const groupedFilteredAlims = filteredAlims.reduce((acc, alim) => {
    const deviceName = alim.device_name;
    if (!acc[deviceName]) {
      acc[deviceName] = [];
    }
    acc[deviceName].push(alim);
    return acc;
  }, {});

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000${url}`;
    link.download = url.substring(url.lastIndexOf('/') + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="main-content mt-5">
      <Container fluid>
        <Row className="mt-3 mb-3">
          <Col md={8} lg={9} className="d-flex justify-content-left titles">알림내역</Col>
          <Col md={4} lg={3}>
            <Form className="d-flex alimsearch">
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form>
          </Col>
        </Row>

        {Object.keys(groupedFilteredAlims).map((deviceName, idx) => {
          const deviceAlims = groupedFilteredAlims[deviceName];
          const isExpanded = expandedDevice === deviceName;
          const visibleAlims = isExpanded ? deviceAlims : deviceAlims.slice(0, 4);

          return (
            <div key={idx} className="device-group">
              <div className="d-flex align-items-center justify-content-start">
                <h4 className="device-title">{deviceName}</h4>
                {deviceAlims.length > 4 && (
                  <Button
                    className="plus-btn ms-2"
                    onClick={() => setExpandedDevice(isExpanded ? null : deviceName)}
                  >
                    <BsThreeDots size={24} />
                    <div className="tooltip-textalim">  
                      클릭하면 전체가 보이고 다시 한 번 더 클릭하면 4개만 보입니다.
                      <div className="tooltip-arrowalim"></div>
                    </div>
                  </Button>
                )}
              </div>
              <Row>
                {visibleAlims.map((alim, index) => (
                  <Col key={index} xs={12} md={6} lg={3} className="g-0">
                    <div className="carda p-3 position-relative alim-card">
                      <div className="date-label">
                        {new Date(alim.sent_at).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <img
                        src={`http://localhost:5000${alim.image}`}
                        onClick={() => handleShow(alim)}
                        className="media-content"
                        alt="알림 이미지"
                        style={{ borderRadius: '10px' }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          );
        })}

        <Modal show={show} onHide={handleClose} centered size="lg">
          <Modal.Body className='alimbodymodal'>
            <Row>
              <Col xs={12} className="video-section position-relative">
                <video
                  src="/videos/test.mp4"
                  controls
                  muted
                  autoPlay
                  loop
                  className="full-video"
                />
              </Col>
              <Col xs={12} className="details-section">
                <Row>
                  <Col xs={6}>
                    <div className="image-container">
                      <img
                        src={`http://localhost:5000${selectedAlim?.image}`}
                        alt="알림 이미지"
                      />
                      <div className="download-section">
                        <Button
                          className="download-btn"
                          onClick={() => handleDownload(selectedAlim?.image)}
                          variant="light"
                        >
                          <BsDownload size={24} />
                        </Button>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} className="details">
                    <p><strong>관측내용:</strong> {selectedAlim?.message}</p>
                    <p><strong>CCTV:</strong> {selectedAlim?.device_name}</p>
                    <p><strong>관측시간:</strong> {new Date(selectedAlim?.sent_at).toLocaleString('ko-KR')}</p>
                    <p><strong>상태:</strong>
                      <Button
                        style={{
                          backgroundColor: selectedAlim?.status === 'success' ? '#BAF2E5' : '#FFC5C5',
                          color: selectedAlim?.status === 'success' ? '#008767' : 'red',
                          border: selectedAlim?.status === 'success' ? '#16C098' : '#FFC5C5',
                          marginLeft:'15px'
                        }}

                      >
                        {selectedAlim?.status === 'success' ? "정상" : "오류"}
                      </Button>
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default Alim;
