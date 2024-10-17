import { useState, useEffect } from "react";
import React from "react";
import "../css/Map.css";
import { Button, Col, Container, Row } from "react-bootstrap";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import { PiGpsFixLight } from "react-icons/pi";


const Map = () => {
  const [radioValue, setRadioValue] = useState("1");
  const [markers, setMarkers] = useState([]);
  const [overlays, setOverlays] = useState([]);
  const [circle, setCircle] = useState(null);  // 현재 위치에 표시할 원 저장
  const [largecircles, setLargeCircle] = useState(null);  // 현재 위치에 표시할 원 저장

  const { kakao } = window;
  const [map, setMap] = useState(null); 
  let ClickOverlay = null;

  const positions = {
    all: [
      {
        title: "시리즈인트로",
        address: "광주 동구 제봉로110번길 1",
        latlng: new kakao.maps.LatLng(35.1484606, 126.9222057),
        pimg: "./image/1시리즈인트로.jpeg",
        Link: "https://map.kakao.com/?map_type=TYPE_MAP&target=car&rt=,,482270,458916&rt1=&rt2=%EC%8B%9C%EB%A6%AC%EC%A6%88%EC%9D%B8%ED%8A%B8%EB%A1%9C&rtIds=,1849034438",
        Link2:
          "http://localhost:3001/CafeInfo?name=시리즈인트로&i=./image/1시리즈인트로.jpeg",
      },
      {
        title: "광주지방경찰청",
        address: "광주 서구 치평동 120",
        latlng: new kakao.maps.LatLng(35.152, 126.874),
        pimg: "./image/police_station.jpeg",
        Link: "https://map.kakao.com/?q=광주지방경찰청",
        Link2:
          "http://localhost:3001/CafeInfo?name=광주지방경찰청&i=./image/police_station.jpeg",
      },

      {
        title: "광주동부경찰서",
        address: "광주광역시 동구 예술길 33",
        latlng: new kakao.maps.LatLng(35.1493177, 126.9199268),
        pimg: "./image/police_station.jpeg",
        Link: "https://map.kakao.com/?q=광주지방경찰청",
        Link2:
          "http://localhost:3001/CafeInfo?name=광주지방경찰청&i=./image/police_station.jpeg",
      },
      {
        title: "광주동부경찰서 충장치안센터",
        address: "광주광역시 동구 충장로 64",
        latlng: new kakao.maps.LatLng(35.14937, 126.9146207),
        pimg: "./image/police_station.jpeg",
        Link: "https://map.kakao.com/?q=광주지방경찰청",
        Link2:
          "http://localhost:3001/CafeInfo?name=광주지방경찰청&i=./image/police_station.jpeg",
      },
      {
        title: "전남대학교병원",
        address: "광주 동구 학동 517-1",
        latlng: new kakao.maps.LatLng(35.144, 126.925),
        pimg: "./image/hospital.jpeg",
        Link: "https://map.kakao.com/?q=전남대학교병원",
        Link2:
          "http://localhost:3001/CafeInfo?name=전남대학교병원&i=./image/hospital.jpeg",
      },
  
    ],
    police: [
      {
        title: "광주지방경찰청",
        address: "광주 서구 치평동 120",
        latlng: new kakao.maps.LatLng(35.152, 126.874),
        pimg: "./image/police_station.jpeg",
        Link: "https://map.kakao.com/?q=광주지방경찰청",
        Link2:
          "http://localhost:3001/CafeInfo?name=광주지방경찰청&i=./image/police_station.jpeg",
      },
      {
        title: "광주동부경찰서",
        address: "광주광역시 동구 예술길 33",
        latlng: new kakao.maps.LatLng(35.1493177, 126.9199268),
        pimg: "./image/police_station.jpeg",
        Link: "https://map.kakao.com/?q=광주지방경찰청",
        Link2:
          "http://localhost:3001/CafeInfo?name=광주지방경찰청&i=./image/police_station.jpeg",
      },
      {
        title: "광주동부경찰서 충장치안센터",
        address: "광주광역시 동구 충장로 64",
        latlng: new kakao.maps.LatLng(35.14937, 126.9146207),
        pimg: "./image/police_station.jpeg",
        Link: "https://map.kakao.com/?q=광주지방경찰청",
        Link2:
          "http://localhost:3001/CafeInfo?name=광주지방경찰청&i=./image/police_station.jpeg",
      },
    ],
    hospital: [
      {
        title: "전남대학교병원",
        address: "광주 동구 학동 517-1",
        latlng: new kakao.maps.LatLng(35.144, 126.925),
        pimg: "./image/hospital.jpeg",
        Link: "https://map.kakao.com/?q=전남대학교병원",
        Link2:
          "http://localhost:3001/CafeInfo?name=전남대학교병원&i=./image/hospital.jpeg",
      },
 
    ],
  };
  
  const displayMarkers = (category) => {
    clearMarkers();
    if (circle || largecircles ) {
      circle.setMap(null);
      largecircles.setMap(null);

    }
    let categoryMarkers = [];
    let categoryOverlays = [];

   
    const policeImageSrc = "img/pica.png"; 
    const hospitalImageSrc = "img/redmarker.jpg"; 
    const policeImageSize = new kakao.maps.Size(64, 69);
    const hospitalImageSize = new kakao.maps.Size(64, 69);
    const policeImageOption = { offset: new kakao.maps.Point(27, 69) };
    const hospitalImageOption = { offset: new kakao.maps.Point(27, 69) };


    if (category === "all") {

      positions["police"].forEach((data) => {
        const markerImage = new kakao.maps.MarkerImage(policeImageSrc, policeImageSize, policeImageOption);
        var marker = new kakao.maps.Marker({
          map: map,
          position: data.latlng,
          image: markerImage,
        });

      
        const overlay = createCustomOverlay(marker, data);
        categoryMarkers.push(marker);
        categoryOverlays.push(overlay);
      });


      positions["hospital"].forEach((data) => {
        const markerImage = new kakao.maps.MarkerImage(hospitalImageSrc, hospitalImageSize, hospitalImageOption);
        var marker = new kakao.maps.Marker({
          map: map,
          position: data.latlng,
          image: markerImage,
        });

  
        const overlay = createCustomOverlay(marker, data);
        categoryMarkers.push(marker);
        categoryOverlays.push(overlay); 
      });
    } else {
     
      positions[category].forEach((data) => {
        const imageSrc = category === "police" ? policeImageSrc : hospitalImageSrc;
        const imageSize = category === "police" ? policeImageSize : hospitalImageSize;
        const imageOption = category === "police" ? policeImageOption : hospitalImageOption;

        const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
        var marker = new kakao.maps.Marker({
          map: map,
          position: data.latlng,
          image: markerImage,
        });

 
        const overlay = createCustomOverlay(marker, data);
        categoryMarkers.push(marker);
        categoryOverlays.push(overlay); 
      });
    }

    setMarkers(categoryMarkers);
    setOverlays(categoryOverlays); 
  };


  const createCustomOverlay = (marker, data) => {
    var CustomOverlays = new kakao.maps.CustomOverlay({
      yAnchor: 1.45,
      position: marker.getPosition(),
    });

    var Customcontent = document.createElement("div");
    Customcontent.className = "wrap";

    var info = document.createElement("div");
    info.className = "info";
    Customcontent.appendChild(info);

    var contentTitle = document.createElement("div");
    contentTitle.className = "title";
    contentTitle.appendChild(document.createTextNode(data.title));
    info.appendChild(contentTitle);

    var closeBtn = document.createElement("div");
    closeBtn.className = "close";
    closeBtn.setAttribute("title", "닫기");
    closeBtn.onclick = function () {
      CustomOverlays.setMap(null);
    };
    contentTitle.appendChild(closeBtn);

    var bodyContent = document.createElement("div");
    bodyContent.className = "body";
    info.appendChild(bodyContent);

    var imgDiv = document.createElement("div");
    imgDiv.className = "img";
    bodyContent.appendChild(imgDiv);

    var imgContent = document.createElement("img");
    imgContent.src = data.pimg;
    imgContent.setAttribute("width", "73px");
    imgContent.setAttribute("heigth", "100px");
    imgDiv.appendChild(imgContent);

    var descContent = document.createElement("div");
    descContent.className = "desc";
    bodyContent.appendChild(descContent);

    var addressContent = document.createElement("div");
    addressContent.className = "ellipsis";
    addressContent.appendChild(document.createTextNode(data.address));
    descContent.appendChild(addressContent);

    var LinkDiv = document.createElement("div");
    descContent.appendChild(LinkDiv);

    var LinkContent = document.createElement("a");
    LinkContent.className = "link";
    LinkContent.appendChild(document.createTextNode("길찾기"));
    LinkContent.addEventListener("click", function () {
      LinkContent.setAttribute("href", data.Link);
    });
    LinkDiv.appendChild(LinkContent);

    var LinkContent2 = document.createElement("a");
    LinkContent2.className = "link2";
    LinkContent2.appendChild(document.createTextNode("예약"));
    LinkContent2.addEventListener("click", function () {
      LinkContent2.setAttribute("href", data.Link2);
    });
    LinkDiv.appendChild(LinkContent2);

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
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    for (let i = 0; i < overlays.length; i++) {
      overlays[i].setMap(null); 
    }
    setMarkers([]);
    setOverlays([]); 
    ClickOverlay = null; 
  };

  // 현재 위치를 받아와서 빨간색 원과 3km 반경의 원을 표시하는 함수
const displayCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const locPosition = new kakao.maps.LatLng(lat, lng);

      // 현재 위치에 빨간색 작은 원을 표시 (기존 원이 있으면 삭제)
        if (circle || largecircles ) {
        circle.setMap(null);
        largecircles.setMap(null);

      }

      // 작은 원 (현재 위치를 중심으로 작은 원)
      const smallCircle = new kakao.maps.Circle({
        center: locPosition,
        radius: 8, // 반경 8미터
        strokeWeight: 5,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        fillColor: '#FF0000',
        fillOpacity: 0.3,
      });

      smallCircle.setMap(map);
      setCircle(smallCircle);

      // 큰 원 (현재 위치를 중심으로 3km 반경의 원)
      const largeCircle = new kakao.maps.Circle({
        center: locPosition,
        radius: 300,
        strokeWeight: 2,
        strokeColor: '#0000FF',
        strokeOpacity: 0.6,
        fillColor: '#0000FF',
        fillOpacity: 0.1,
      });

      largeCircle.setMap(map);
      setLargeCircle(largeCircle);

      map.setCenter(locPosition); // 지도의 중심을 현재 위치로 이동
    });
  } else {
    alert("현재 위치를 찾을 수 없습니다.");
  }
};


  useEffect(() => {
    let mapContainer = document.getElementById("map"),
      mapOption = {
        center: new kakao.maps.LatLng(35.14919975177639, 126.92453208436793),
        level: 3,
      };

    const newMap = new kakao.maps.Map(mapContainer, mapOption);
    setMap(newMap); 

    // 처음에는 '전체' 카테고리 표시
    displayMarkers("all");
  }, []);

  useEffect(() => {
    if (map) {
      ClickOverlay = null; 
      displayMarkers(radioValue === "1" ? "all" : radioValue === "2" ? "police" : "hospital");
    }
  }, [radioValue, map]);

  return (
    <div className="main-content">
      <Container fluid>
        {/* <Row className="mt-3 mb-3">
          <Col className="d-flex justify-content-left titles">지도</Col>
        </Row> */}
        <Row>
          <Col>
            <ButtonGroup>
              {[{ name: "전체", value: "1" }, { name: "경찰서", value: "2" }, { name: "병원", value: "3" }]
                .map((radio, idx) => (
                  <ToggleButton
                    key={idx}
                    id={`radio-${idx}`}
                    type="radio"
                    variant={idx % 2 ? "outline-success" : "outline-danger"}
                    name="radio"
                    value={radio.value}
                    checked={radioValue === radio.value}
                    onChange={(e) => setRadioValue(e.currentTarget.value)}
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
            <Button variant="outline-primary" className="d-flex justify-content-end"onClick={displayCurrentLocation}  style={{position: "absolute" ,zIndex:"2",backgroundColor:"white",color:"black",border:"none",borderRadius:"50%",marginTop:"15px",marginLeft:"15px"}}>
            <PiGpsFixLight/>
            </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Map;
