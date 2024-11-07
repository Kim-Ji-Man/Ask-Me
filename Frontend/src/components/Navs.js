import React, { useCallback, useEffect, useState, useRef } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCircle,
  FaBell,
  FaCog,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import "../css/Nav.css";
import axios from "../axios";
import useWebSocket from "../Hooks/useWebSocket";

function Navs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [memberGrade, setMemberGrade] = useState(2); // 기본값을 user로 설정
  const [hasNewAlert, setHasNewAlert] = useState(() => {
    // 초기값을 로컬 스토리지에서 불러옴
    return localStorage.getItem('hasNewAlert') === 'true';
}); 
const [alertCount, setAlertCount] = useState(0); // 기존 알림 개수

  const alertRef = useRef(null);

// 경고 토글 함수
const toggleAlert = () => {
  setIsAlertOpen(!isAlertOpen);
  if (hasNewAlert) {
    setHasNewAlert(false); // 알림창 열리면 새로운 알림 표시 제거
    localStorage.setItem('hasNewAlert', 'false'); // 로컬 스토리지 업데이트
  }
};
  

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertRef.current && !alertRef.current.contains(event.target)) {
        setIsAlertOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [alertRef]);

  // 경로 이동 함수
  const navigateTo = useCallback(
    (path) => {
      navigate(path);
      setActiveMenu(path);
      localStorage.setItem("activeMenu", path);
      setExpanded(false);
    },
    [navigate]
  );
  
const fetchAlerts = async (isNewNotification = false) => {
  try {
          // role에 따라 다른 API 엔드포인트 또는 쿼리 파라미터 설정
          let apiUrl = '/Alim/alertlist';
      
          if (memberGrade === 0) { // master
              apiUrl = '/Member';
          } else if (memberGrade === 1) { // admin
              apiUrl = '/Alim/alertlist';
          }
          const response = await axios.get(apiUrl);
      
      // 새로운 알림 개수 확인을 통해 `hasNewAlert` 업데이트
      if (isNewNotification && response.data.length > alertCount) { 
          setHasNewAlert(true);
          localStorage.setItem('hasNewAlert', 'true');
          setAlertCount(response.data.length);
          console.log(response.data.length,"네비1");
          
      }
      console.log(response.data,"어떻게 나오니??");
      
      setAlerts(response.data); // 항상 최신 알림 리스트로 설정
      setAlertCount(response.data.length); // 알림 개수 업데이트
      console.log(response.data.length,"네비2");


  } catch (error) {
      console.error('Error fetching alerts:', error);
  }
};

  // 웹소켓 메시지 처리 함수
  const handleMessage = (data) => {
    if (data.type === 'notification') {
      console.log("새로운 알림:", data.message);
      fetchAlerts(true);
      setHasNewAlert(true); // 새로운 알림이 있음을 표시
    }

    if (data.type === 'register') {
      console.log("새로운 회원가입 알림:", data.message);
      fetchAlerts(true);
      setHasNewAlert(true); // 새로운 알림이 있음을 표시
    }
    
    // 다른 알림 처리도 여기에 추가 가능
  };

  // JWT 토큰 가져오기
  const token = localStorage.getItem('jwtToken');

  // WebSocket 커스텀 훅 사용
  useWebSocket(token, handleMessage);


// 경로 변경 시마다 fetchAlerts 호출
useEffect(() => {
    fetchAlerts(); // 알림 데이터를 항상 최신 상태로 유지
}, [location.pathname,memberGrade]); // 경로 변경 시마다 실행

  // 시간 계산 함수
  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: "년", seconds: 31536000 },
      { label: "개월", seconds: 2592000 },
      { label: "일", seconds: 86400 },
      { label: "시간", seconds: 3600 },
      { label: "분", seconds: 60 },
      { label: "초", seconds: 1 },
    ];

    for (let i = 0; i < intervals.length; i++) {
      const interval = Math.floor(seconds / intervals[i].seconds);
      if (interval >= 1) {
        return `${interval} ${intervals[i].label} 전`;
      }
    }
    return "방금 전";
  };

  useEffect(() => {
const jwtToken = localStorage.getItem("jwtToken");

    if (jwtToken) {
      const decodedToken = jwtDecode(jwtToken);
      // decodedToken의 role 필드를 기반으로 memberGrade 설정
      if (decodedToken.role === "master") {
        setMemberGrade(0);
      } else if (decodedToken.role === "admin") {
        setMemberGrade(1);
      } else if (decodedToken.role === "guard") {
        setMemberGrade(2);
      } else {
        setMemberGrade(3);
      }
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setMemberGrade(3); // 로그인하지 않은 경우 기본값을 user(3)로 설정
    }

    const savedActiveMenu = localStorage.getItem("activeMenu") || "/";
    setActiveMenu(savedActiveMenu);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    localStorage.removeItem("activeMenu");
    window.location.href = "/";
  };

  // 활성화 스타일 및 기본 스타일 정의
  const activeStyle = {
    color: "black",
    fontWeight: "bold",
  };

  const defaultStyle = {
    color: "lightgrey",
  };

  // 아이콘 렌더링 함수
  const renderIcon = (level) => {
    switch (level) {
      case "high":
        return <FaBell style={{ color: "red", marginRight: 5 }} />;
      case "medium":
        return <FaBell style={{ color: "orange", marginRight: 5 }} />;
      case "low":
        return <FaBell style={{ color: "yellow", marginRight: 5 }} />;
      default:
        return null;
    }
  };
  
  const getRoleInKorean = (role) => {
    switch (role) {
      case 'master':
        return '마스터';
      case 'admin':
        return '관리자';
      case 'guard':
        return '경비원';
      case 'user':
        return '일반사용자';
      default:
        return '알 수 없는 역할';
    }
  };

  return (
    <Navbar
      expand="lg"
      className={`custom-navbar ${isScrolled ? "scrolled" : ""}`}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container style={{ maxWidth: "80%" }}>
        <Navbar.Brand onClick={() => navigateTo("/Main")}>
          <img src="img/AskMeLogo1.png" alt="로고" className="navbar-logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto justify-content-center">
            {isLoggedIn && memberGrade === 1 && (
              <Nav.Link
                onClick={() => navigateTo("/Main")}
                style={activeMenu === "/Main" ? activeStyle : defaultStyle}
              >
                대시보드
              </Nav.Link>
            )}
            {isLoggedIn && memberGrade === 0 && (
              <Nav.Link
                onClick={() => navigateTo("/MainMaster")}
                style={
                  activeMenu === "/MainMaster" ? activeStyle : defaultStyle
                }
              >
                대시보드
              </Nav.Link>
            )}
            <Nav.Link
              onClick={() => navigateTo("/CCTV")}
              style={activeMenu === "/CCTV" ? activeStyle : defaultStyle}
            >
              CCTV
            </Nav.Link>
            {isLoggedIn && memberGrade === 0 && (
              <>
                <Nav.Link
                  onClick={() => navigateTo("/MemberMaster")}
                  style={
                    activeMenu === "/MemberMaster" ? activeStyle : defaultStyle
                  }
                >
                  회원관리
                </Nav.Link>
              </>
            )}
            {isLoggedIn && memberGrade === 1 && (
              <>
                <Nav.Link
                  onClick={() => navigateTo("/Member")}
                  style={activeMenu === "/Member" ? activeStyle : defaultStyle}
                >
                  회원관리
                </Nav.Link>
              </>
            )}

            {isLoggedIn &&
              memberGrade === 0 && ( // master 사용자만 표시
                <>
                  {/* <Nav.Link onClick={() => navigateTo("/Error")} style={activeMenu === "/Error" ? activeStyle : defaultStyle}>
                  이상내역
                </Nav.Link> */}
                  <Nav.Link
                    onClick={() => navigateTo("/BoardMaster")}
                    style={
                      activeMenu === "/BoardMaster" ? activeStyle : defaultStyle
                    }
                  >
                    커뮤니티
                  </Nav.Link>
                </>
              )}
            {isLoggedIn && memberGrade === 0 && (
              <Nav.Link
                onClick={() => navigateTo("/AlimsMaster")}
                style={
                  activeMenu === "/AlimsMaster" ? activeStyle : defaultStyle
                }
              >
                알림내역
              </Nav.Link>
            )}
            {isLoggedIn && memberGrade === 1 && (
              <Nav.Link
                onClick={() => navigateTo("/Alims")}
                style={activeMenu === "/Alims" ? activeStyle : defaultStyle}
              >
                알림내역
              </Nav.Link>
            )}
          </Nav>
          <Nav className="align-items-center">
            <div className="icon-links">
              {/* 마스터가 아닐 때만 사용자 아이콘 보이기 */}
              {memberGrade !== 0 && (
                <FaUserCircle
                  size={24}
                  onClick={() => navigateTo("/Mypage")}
                  style={activeMenu === "/Mypage" ? activeStyle : defaultStyle}
                />
              )}

<div className="alert-icon" onClick={toggleAlert} ref={alertRef}>
  {/* memberGrade가 1일 경우 (관리자) */}
  {memberGrade === 1 && (
    <>
      <FaBell size={24} style={{ color: hasNewAlert ? 'red' : 'lightgrey' }} />
      {!isAlertOpen && alerts.length > 0 && hasNewAlert && (
        <span className="badge"></span>
      )}

      {isAlertOpen && (
        <div className="alert-dropdown">
          <div className="alert-header">
            <strong>알림</strong>
          </div>
          <ul>
            {alerts.slice(0, 5).map((alert) => (
              <li key={`${alert.alert_id}-${alert.device_name}`} className={alert.level}>
                {renderIcon(alert.level)}
                <span className="message">{`${alert.device_name}에서 ${alert.message}`}</span>
                <br />
                <small className="timestamp">{timeSince(alert.detection_time)}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )}

  {/* memberGrade가 0일 경우 (마스터) */}
  {memberGrade === 0 && (
    <>
      <FaBell size={24} style={{ color: hasNewAlert ? 'red' : 'lightgrey' }} />
      {!isAlertOpen && alerts.length > 0 && hasNewAlert && (
        <span className="badge"></span>
      )}
      
      {isAlertOpen && (
        <div className="alert-dropdown">
          <div className="alert-header">
            <strong>알림</strong>
          </div>
          <ul>
            {alerts.slice(0, 5).map((alert) => (
              <li key={`${alert.alert_id}-${alert.username}`}>
                  <span className="message"> {`${alert.mem_name}님이 ${getRoleInKorean(alert.role)}로 회원가입하였습니다.`}</span>
                <br />
                <small className="timestamp">{timeSince(alert.created_at)}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )}
</div>
              {/* <FaCog
                size={24}
                onClick={() => navigateTo("/Settings")}
                style={defaultStyle}
              /> */}
            </div>
            <Nav.Link onClick={logout} style={defaultStyle}>
              로그아웃
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navs;
