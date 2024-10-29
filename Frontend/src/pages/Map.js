import { useState, useEffect } from "react";
import React from "react";
import "../css/Map.css";
import { Button, Col, Container, Row } from "react-bootstrap";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import { PiGpsFixLight } from "react-icons/pi";
import axios from "../axios";

const Map = () => {
  const [radioValue, setRadioValue] = useState("2");
  const [markers, setMarkers] = useState([]);
  const [overlays, setOverlays] = useState([]);
  const [circle, setCircle] = useState(null);
  const [largecircles, setLargeCircle] = useState(null);
  const [info, setInfo] = useState([]);
  const [positions, setPositions] = useState({ police: [], hospital: [] });
  const { kakao } = window;
  const [map, setMap] = useState(null);
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

    axios
      .get("/Map")
      .then((res) => {
        setInfo(res.data);
        console.log("info 데이터 가져와짐", res.data);

        // 경찰서와 병원 위치 데이터를 newPositions에 저장
        const newPositions = { police: [], hospital: [] };

        res.data.forEach((item) => {
          const positionData = {
            title: item.name,
            address: item.address,
            phone: `전화번호 : ${item.phone_number}`,
            latlng: new kakao.maps.LatLng(
              parseFloat(item.latitude),
              parseFloat(item.longitude)
            ),
            // pimg: item.type === "police" ? "img/police.png" : "img/redmarker.jpg",
            type: item.type,
          };

          if (item.type === "police") {
            newPositions.police.push(positionData);
          } else if (item.type === "hospital") {
            newPositions.hospital.push(positionData);
          }
        });

        setPositions(newPositions);

        // 지도가 로드된 후 기본으로 경찰서와 병원 마커 표시
        if (newMap) {
          setRadioValue("1"); // 초기 로드 시 전체 마커를 표시하기 위해 radioValue 설정
          displayMarkers("police");
          displayMarkers("hospital");
        }
      })
      .catch(() => {
        console.log("데이터 가져오기 실패");
      });
  }, []);

  useEffect(() => {
    if (map && radioValue) {
      clearMarkers(); // 기존 마커 지우기
      if (radioValue === "1") {
        displayMarkers("police");
        displayMarkers("hospital");
      } else if (radioValue === "2") {
        displayMarkers("police");
      } else if (radioValue === "3") {
        displayMarkers("hospital");
      }
    }
  }, [radioValue, map]);

  const displayMarkers = (category) => {
    let categoryMarkers = [];
    let categoryOverlays = [];

    const policeImageSrc = "img/police.png";
    const hospitalImageSrc = "img/hospital.png";
    const policeImageSize = new kakao.maps.Size(64, 69);
    const hospitalImageSize = new kakao.maps.Size(64, 69);
    const policeImageOption = { offset: new kakao.maps.Point(27, 69) };
    const hospitalImageOption = { offset: new kakao.maps.Point(27, 69) };

    positions[category].forEach((data) => {
      const imageSrc =
        category === "police" ? policeImageSrc : hospitalImageSrc;
      const imageSize =
        category === "police" ? policeImageSize : hospitalImageSize;
      const imageOption =
        category === "police" ? policeImageOption : hospitalImageOption;

      const markerImage = new kakao.maps.MarkerImage(
        imageSrc,
        imageSize,
        imageOption
      );
      const marker = new kakao.maps.Marker({
        map: map,
        position: data.latlng,
        image: markerImage,
      });

      const overlay = createCustomOverlay(marker, data);
      categoryMarkers.push(marker);
      categoryOverlays.push(overlay);
    });

    setMarkers((prevMarkers) => [...prevMarkers, ...categoryMarkers]);
    setOverlays((prevOverlays) => [...prevOverlays, ...categoryOverlays]);
  };

  const createCustomOverlay = (marker, data) => {
    const CustomOverlays = new kakao.maps.CustomOverlay({
      yAnchor: 1.45,
      position: marker.getPosition(),
    });
    console.log(data);

    const Customcontent = document.createElement("div");
    Customcontent.className = "wrap";

    const info = document.createElement("div");
    info.className = "info";
    Customcontent.appendChild(info);

    const contentTitle = document.createElement("div");
    contentTitle.className = "title";
    contentTitle.appendChild(document.createTextNode(data.title));
    info.appendChild(contentTitle);

    const closeBtn = document.createElement("div");
    closeBtn.className = "close";
    closeBtn.setAttribute("title", "닫기");
    closeBtn.onclick = function () {
      CustomOverlays.setMap(null);
    };
    contentTitle.appendChild(closeBtn);

    const bodyContent = document.createElement("div");
    bodyContent.className = "body";
    info.appendChild(bodyContent);

    // const imgDiv = document.createElement("div");
    // imgDiv.className = "img";
    // bodyContent.appendChild(imgDiv);

    // const imgContent = document.createElement("img");
    // imgContent.src = data.pimg;
    // imgContent.setAttribute("width", "73px");
    // imgContent.setAttribute("height", "100px");
    // imgDiv.appendChild(imgContent);

    const descContent = document.createElement("div");
    descContent.className = "desc";
    bodyContent.appendChild(descContent);

    const addressContent = document.createElement("div");
    addressContent.className = "ellipsis";
    addressContent.appendChild(document.createTextNode(data.address));
    descContent.appendChild(addressContent);

    const phoneContent = document.createElement("div");
    phoneContent.className = "phone";
    phoneContent.appendChild(document.createTextNode(data.phone));
    descContent.appendChild(phoneContent);

    // const LinkDiv = document.createElement("div");
    // descContent.appendChild(LinkDiv);

    // const LinkContent = document.createElement("a");
    // LinkContent.className = "link";
    // LinkContent.appendChild(document.createTextNode("길찾기"));
    // LinkContent.addEventListener("click", function () {
    //   LinkContent.setAttribute("href", data.Link);
    // });
    // LinkDiv.appendChild(LinkContent);

    // const LinkContent2 = document.createElement("a");
    // LinkContent2.className = "link2";
    // LinkContent2.appendChild(document.createTextNode("예약"));
    // LinkContent2.addEventListener("click", function () {
    //   LinkContent2.setAttribute("href", data.Link2);
    // });
    // LinkDiv.appendChild(LinkContent2);

    CustomOverlays.setContent(Customcontent);

    kakao.maps.event.addListener(marker, "click", function () {
      if (ClickOverlay) {
        ClickOverlay.setMap(null);
      }

      CustomOverlays.setMap(map);
      ClickOverlay = CustomOverlays;
    });

    return CustomOverlays;
  };

  const clearMarkers = () => {
    markers.forEach((marker) => marker.setMap(null));
    overlays.forEach((overlay) => overlay.setMap(null));
    setMarkers([]);
    setOverlays([]);
    ClickOverlay = null;
  };

  const displayCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const locPosition = new kakao.maps.LatLng(lat, lng);

        if (circle || largecircles) {
          circle.setMap(null);
          largecircles.setMap(null);
        }

        const smallCircle = new kakao.maps.Circle({
          center: locPosition,
          radius: 8,
          strokeWeight: 5,
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          fillColor: "#FF0000",
          fillOpacity: 0.3,
        });

        smallCircle.setMap(map);
        setCircle(smallCircle);

        const largeCircle = new kakao.maps.Circle({
          center: locPosition,
          radius: 300,
          strokeWeight: 2,
          strokeColor: "#0000FF",
          strokeOpacity: 0.6,
          fillColor: "#0000FF",
          fillOpacity: 0.1,
        });

        largeCircle.setMap(map);
        setLargeCircle(largeCircle);

        map.setCenter(locPosition);
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
  {[
    { name: "전체", value: "1", color: "orange", textColor: "white" },
    { name: "경찰서", value: "2", color: "black", textColor: "white" },
    { name: "병원", value: "3", color: "blue", textColor: "white"},
  ].map((radio, idx) => (
    <ToggleButton
      key={idx}
      id={`radio-${idx}`}
      type="radio"
      className="custom-button"
      name="radio"
      value={radio.value}
      checked={radioValue === radio.value}
      onChange={(e) => setRadioValue(e.currentTarget.value)}
      style={{
        backgroundColor: radioValue === radio.value ? radio.color : "white",
        color: radioValue === radio.value ? radio.textColor : "black",
       fontWeight : radioValue === radio.value ? "bold" : radio.fontWeight,
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
