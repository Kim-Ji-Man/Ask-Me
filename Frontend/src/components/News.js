import React, { useState, useEffect } from "react";
import { Col, Container, Image, Row } from "react-bootstrap";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import "../css/News.css"; // CSS 파일 import

const newsItems = [
  {
    image: "img/hyo1.PNG",
    title: "순천 10대 묻지마 살해범 박대성 검찰 구속 송치",
    description: "'묻지 마 살해범' 박대성 사건 보고서, SNS에 유포 ...",
    date: "2024-10-11",
    url: "https://www.hankyung.com/article/2024100443497", // 링크 추가
  },
  {
    image: "img/hyo2.jpg",
    title: "1명 살해·3명 살인미수 '신림동 흉기난동' 조선 무기징역 확정",
    description: `속보=대낮에 서울 관악구 신림동에서 무고한 시민들을 ...`,
    date: "2024-10-12",
    url: "https://www.kwnews.co.kr/page/view/2024091210514491845", // 링크 추가
  },
  {
    image: "img/hyo3.jpg",
    title: `"여친 퇴원시켜줘" 병원서 흉기 난동에 보안요원 폭행한 40대`,
    description: `대학병원에서 흉기를 꺼내 들며 소란을 피우고 ...`,
    date: "2024-10-13",
    url: "https://www.imaeil.com/page/view/2024100606343588167", // 링크 추가
  },
];

const News = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + newsItems.length) % newsItems.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
  };

  // 자동 슬라이드 기능
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
    }, 5000); // 5초마다 변경 (5000ms)

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 interval 정리
  }, []);

  return (
    <Container fluid className="news-container">
      <Row className="align-items-center justify-content-center">
        <Col xs={1} md={1} lg={1} className="text-center">
          <button className="arrow-button" onClick={handlePrev}>
            <IoIosArrowBack />
          </button>
        </Col>
        <Col xs={10} md={6} lg={6} className="d-flex flex-column align-items-center">
          <a href={newsItems[currentIndex].url} target="_blank" rel="noopener noreferrer">
            <Image src={newsItems[currentIndex].image} fluid className="news-image" />
          </a>
          <div className="news-content">
            <a href={newsItems[currentIndex].url} target="_blank" rel="noopener noreferrer">
              <h1 className="news-title">{newsItems[currentIndex].title}</h1>
            </a>
            <p className="news-date">{newsItems[currentIndex].date}</p>
            <p className="news-description">
              {newsItems[currentIndex].description}
            </p>
          </div>
        </Col>
        <Col xs={1} md={1} lg={1} className="text-center">
          <button className="arrow-button" onClick={handleNext}>
            <IoIosArrowForward />
          </button>
        </Col>
      </Row>
    </Container>
  );
};

export default News;
