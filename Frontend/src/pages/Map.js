import { useState, useEffect } from "react";
import React from "react";
import "../css/Map.css";
import { Button, Col, Container, Row } from "react-bootstrap";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import { PiGpsFixLight } from "react-icons/pi";
import axios from "../axios";

const Map = () => {
  const [radioValue, setRadioValue] = useState("1"); // 1: 전체, 2: 경찰서, 3: 병원, 4: 흉기 알림
  const [policeMarkers, setPoliceMarkers] = useState([]);
  const [hospitalMarkers, setHospitalMarkers] = useState([]);
  const [alimMarkers, setAlimMarkers] = useState([]);
  const { kakao } = window;
  const [map, setMap] = useState(null);
  const [locationMarker, setLocationMarker] = useState(null);
  const [locationCircle, setLocationCircle] = useState(null);
  let ClickOverlay = null;

  useEffect(() => {
    // 지도 생성 및 설정
    let mapContainer = document.getElementById("map"),
      mapOption = {
        center: new kakao.maps.LatLng(35.14919975177639, 126.92453208436793),
        level: 3,
      };

    const newMap = new kakao.maps.Map(mapContainer, mapOption);
    setMap(newMap);

    // 경찰서와 병원 데이터 가져오기
    axios
      .get("/Map")
      .then((res) => {
        const policeData = res.data.filter(item => item.type === "police");
        const hospitalData = res.data.filter(item => item.type === "hospital");
        
        setPoliceMarkers(createMarkers(policeData, "police", newMap));
        setHospitalMarkers(createMarkers(hospitalData, "hospital", newMap));
      })
      .catch(() => {
        console.log("경찰서 및 병원 데이터 가져오기 실패");
      });

    // 흉기 알림 데이터 가져오기
    axios
      .get("/Map/Alim")
      .then((res) => {
        setAlimMarkers(createMarkers(res.data, "alim", newMap));
        console.log(res.data,"흉기");
        
      })
      .catch(() => {
        console.log("흉기 알림 데이터 가져오기 실패");
      });
  }, []);

  useEffect(() => {
    if (map) {
      clearMarkers();
      if (radioValue === "1") {
        policeMarkers.forEach(marker => marker.setMap(map));
        hospitalMarkers.forEach(marker => marker.setMap(map));
        alimMarkers.forEach(marker => marker.setMap(map));
      } else if (radioValue === "2") {
        policeMarkers.forEach(marker => marker.setMap(map));
      } else if (radioValue === "3") {
        hospitalMarkers.forEach(marker => marker.setMap(map));
      } else if (radioValue === "4") {
        alimMarkers.forEach(marker => marker.setMap(map));
      }
    }
  }, [radioValue, map, policeMarkers, hospitalMarkers, alimMarkers]);

  const createMarkers = (data, category, map) => {
    const imageSrc = {
      police: "img/police.png",
      hospital: "img/hospital.png",
      alim: "img/hyoiconmarker.png"
    }[category];

    const markers = data.map(item => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(item.latitude, item.longitude),
        image: new kakao.maps.MarkerImage(imageSrc, new kakao.maps.Size(64, 69), {
          offset: new kakao.maps.Point(27, 69)
        })
      });
      const overlay = createCustomOverlay(marker, item, category);
      kakao.maps.event.addListener(marker, "click", () => {
        if (ClickOverlay) ClickOverlay.setMap(null);
        overlay.setMap(map);
        ClickOverlay = overlay;
      });
      return marker;
    });
    return markers;
  };

  const createCustomOverlay = (marker, data, category) => {
    const overlay = new kakao.maps.CustomOverlay({
      yAnchor: 1.45,
      position: marker.getPosition()
    });

    const detectionTime = data.detection_time 
    ? new Date(data.detection_time).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) 
    : "정보 없음";

    const content = document.createElement("div");
    content.className = "wrap";
    content.innerHTML = `
      <div class="info">
        <div class="title">${data.name || data.store_name} 
          <div class="close" title="닫기" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()"></div>
        </div>
        <div class="body">
          <div class="desc">
            <div class="ellipsis">${data.address || detectionTime}</div>
            <div class="phone">${data.phone_number || data.detected_weapon || "정보 없음"}</div>
          </div>
        </div>
      </div>
    `;
    overlay.setContent(content);
    return overlay;
  };

  const clearMarkers = () => {
    policeMarkers.forEach(marker => marker.setMap(null));
    hospitalMarkers.forEach(marker => marker.setMap(null));
    alimMarkers.forEach(marker => marker.setMap(null));
    if (locationMarker) locationMarker.setMap(null);
    if (locationCircle) locationCircle.setMap(null);
    ClickOverlay = null;
  };

  const displayCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const locPosition = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
  
        // 기존 위치 마커와 원을 제거
        if (locationMarker) {
          locationMarker.setMap(null);
        }
        if (locationCircle) {
          locationCircle.setMap(null);
        }
  
        // 현재 위치에 빨간색 원 마커 표시
        const marker = new kakao.maps.Circle({
          center: locPosition,
          radius: 10, // 작은 원의 반지름
          strokeWeight: 0,
          fillColor: "#FF0000",
          fillOpacity: 0.8,
        });
        marker.setMap(map);
        setLocationMarker(marker);
  
        // 현재 위치에서 반경 2km의 초록색 원 표시
        const circle = new kakao.maps.Circle({
          center: locPosition,
          radius: 2000, // 반경 2km
          strokeWeight: 1,
          strokeColor: "#008000",
          strokeOpacity: 0.8,
          fillColor: "#00FF00",
          fillOpacity: 0.2,
        });
        circle.setMap(map);
        setLocationCircle(circle);
  
        // 지도의 중심을 현재 위치로 이동하고, 레벨을 3으로 설정
        map.setCenter(locPosition);
        map.setLevel(3);
      });
    } else {
      alert("현재 위치를 찾을 수 없습니다.");
    }
  };

  return (
    <div className="main-content">
      <Container fluid>
        <Row>
          <Col>
          <ButtonGroup>
  {[{ name: "전체", value: "1" }, { name: "경찰서", value: "2" }, { name: "병원", value: "3" }, { name: "흉기 알림", value: "4" }].map((radio, idx) => (
    <ToggleButton
      key={idx}
      id={`radio-${idx}`}
      type="radio"
      name="radio"
      value={radio.value}
      checked={radioValue === radio.value}
      onChange={(e) => setRadioValue(e.currentTarget.value)}
      style={{
        backgroundColor: 
          radioValue === radio.value
            ? radio.value === "2"
              ? "black"
              : radio.value === "3"
              ? "blue"
              : radio.value === "4"
              ? "red"
              : "orange"
            : "white",
        color: radioValue === radio.value ? "white" : "black"
      }}
    >
      {radio.name}
    </ToggleButton>
  ))}
</ButtonGroup>
          </Col>
        </Row>
        <Row className="mt-5">
          <Col className="mt-5">
            <div id="map" style={{ width: "100%", height: "640px" }}>
              <Button
                variant="outline-primary"
                className="d-flex justify-content-end"
                onClick={displayCurrentLocation}
                style={{
                  position: "absolute",
                  zIndex: "2",
                  backgroundColor: "white",
                  color: "black",
                  border: "none",
                  borderRadius: "50%",
                  marginTop: "15px",
                  marginLeft: "15px",
                }}
              >
                <PiGpsFixLight />
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Map;
