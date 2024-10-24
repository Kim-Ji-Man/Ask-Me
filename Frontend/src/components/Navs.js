import React, { useCallback, useEffect, useState, useRef } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle, FaBell, FaCog, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import "../css/Nav.css";

function Navs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [memberGrade, setMemberGrade] = useState(2); // 기본값을 user로 설정

  // 알림 리스트 (시간 포함 및 타입 추가)
  const notificationList = [
    { id: 1, type: "알림", message: "CCTV에서 의심스러운 움직임 감지", time: new Date(Date.now() - 60000) },
    { id: 2, type: "정보", message: "회원 정보가 성공적으로 업데이트되었습니다.", time: new Date(Date.now() - 3600000) },
    { id: 3, type: "경고", message: "서버 점검이 곧 시작됩니다.", time: new Date(Date.now() - 86400000) },
    { id: 4, type: "알림", message: "CCTV에서 의심스러운 움직임 감지", time: new Date(Date.now() - 900000) },
    { id: 5, type: "알림", message: "CCTV에서 의심스러운 움직임 감지", time: new Date(Date.now() - 172800000) },
  ];

  const notificationRef = useRef(null);

  // 알림 토글 함수
  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setNotifications(0); // 알림 수 초기화
  };

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  // 경로 이동 함수
  const navigateTo = useCallback((path) => {
    navigate(path);
    setActiveMenu(path);
    localStorage.setItem("activeMenu", path);
    setExpanded(false);
  }, [navigate]);

  // 시간 계산 함수
  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
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
    const jwtToken = localStorage.getItem('jwtToken');

    if (jwtToken) {
      const decodedToken = jwtDecode(jwtToken);
      // decodedToken의 role 필드를 기반으로 memberGrade 설정
      if (decodedToken.role === 'master') {
        setMemberGrade(0);
      } else if (decodedToken.role === 'admin') {
        setMemberGrade(1);
      } else if (decodedToken.role === 'guard') {
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

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('jwtToken');
    setIsLoggedIn(false);
    localStorage.removeItem("activeMenu");
    window.location.href = "/";
  };

  // 활성화 스타일 및 기본 스타일 정의
  const activeStyle = {
    color: 'black',
    fontWeight: 'bold'
  };

  const defaultStyle = {
    color: 'lightgrey'
  };

  // 아이콘 렌더링 함수
  const renderIcon = (type) => {
    switch (type) {
      case "알림":
        return <FaBell style={{ color: "orange", marginRight: 5 }} />;
      case "정보":
        return <FaInfoCircle style={{ color: "blue", marginRight: 5 }} />;
      case "경고":
        return <FaExclamationTriangle style={{ color: "red", marginRight: 5 }} />;
      default:
        return null;
    }
  };

  return (
    <Navbar expand="lg" className={`custom-navbar ${isScrolled ? 'scrolled' : ''}`} expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      <Container style={{ maxWidth: "80%" }}>
        <Navbar.Brand onClick={() => navigateTo("/Main")}>
          <img src="img/AskMeLogo1.png" alt="로고" className="navbar-logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto justify-content-center">
          {isLoggedIn && ( memberGrade === 1) && (
            <Nav.Link onClick={() => navigateTo("/Main")} style={activeMenu === "/Main" ? activeStyle : defaultStyle}>
              대시보드
            </Nav.Link>
                   )}
            {isLoggedIn && ( memberGrade === 0) && (
            <Nav.Link onClick={() => navigateTo("/MainMaster")} style={activeMenu === "/MainMaster" ? activeStyle : defaultStyle}>
              대시보드
            </Nav.Link>
                   )}
            <Nav.Link onClick={() => navigateTo("/CCTV")} style={activeMenu === "/CCTV" ? activeStyle : defaultStyle}>
              CCTV
            </Nav.Link>
            {isLoggedIn && (memberGrade === 0) && ( 
              <>
                <Nav.Link onClick={() => navigateTo("/MemberMaster")} style={activeMenu === "/MemberMaster" ? activeStyle : defaultStyle}>
                  회원관리
                </Nav.Link>
              </>
            )}
              {isLoggedIn && (memberGrade === 1) && (
              <>
                <Nav.Link onClick={() => navigateTo("/Member")} style={activeMenu === "/Member" ? activeStyle : defaultStyle}>
                  회원관리
                </Nav.Link>
              </>
            )}
           
           
            {isLoggedIn && memberGrade === 0 && ( // master 사용자만 표시
              <>
                <Nav.Link onClick={() => navigateTo("/Error")} style={activeMenu === "/Error" ? activeStyle : defaultStyle}>
                  이상내역
                </Nav.Link>
              </>
            )}
            <Nav.Link onClick={() => navigateTo("/Alims")} style={activeMenu === "/Alims" ? activeStyle : defaultStyle}>
              알림내역
            </Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            <div className="icon-links">
            {/* 마스터가 아닐 때만 사용자 아이콘 보이기 */}
            {memberGrade !== 0 && (
            <FaUserCircle size={24} onClick={() => navigateTo("/Mypage")} style={defaultStyle} />)}

              <div className="notification-icon" onClick={toggleNotification} ref={notificationRef}>
                <FaBell size={24} style={defaultStyle} />
                {notifications > 0 && <span className="badge">{notifications}</span>}
                
                {isNotificationOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <strong>알림</strong>
                    </div>
                    <ul>
                      {notificationList.slice(0, 5).map(notification => (
                        <li key={notification.id} className={notification.type}>
                          {renderIcon(notification.type)}
                          <span className="message">{notification.message}</span>
                          <br />
                          <small className="timestamp">{timeSince(notification.time)}</small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <FaCog size={24} onClick={() => navigateTo("/Settings")} style={defaultStyle} />
            </div>
            <Nav.Link onClick={logout} style={defaultStyle}>로그아웃</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navs;