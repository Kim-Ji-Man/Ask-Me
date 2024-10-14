import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";
import "../css/Nav.css"; // 스타일 파일

function NotificationDropdown() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: "알림", message: "신규 알림: CCTV에서 의심스러운 움직임 감지", time: new Date(Date.now() - 60000) },
    { id: 2, type: "경고", message: "경고: 서버 점검이 곧 시작됩니다.", time: new Date(Date.now() - 3600000) },
    { id: 3, type: "정보", message: "정보: 회원 정보가 성공적으로 업데이트되었습니다.", time: new Date(Date.now() - 86400000) },
  ]);

  const notificationRef = useRef(null);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

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

  const getIconByType = (type) => {
    switch (type) {
      case "알림":
        return <FaBell size={20} style={{ color: "#007bff" }} />;
      case "경고":
        return <FaExclamationCircle size={20} style={{ color: "#dc3545" }} />;
      case "정보":
        return <FaInfoCircle size={20} style={{ color: "#17a2b8" }} />;
      default:
        return null;
    }
  };

  return (
    <div className="notification-icon" onClick={toggleNotification} ref={notificationRef}>
      <FaBell size={24} style={{ color: "#grey" }} />
      {notifications.length > 0 && <span className="badge">{notifications.length}</span>}

      {isNotificationOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">알림</div>
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id} className={`notification-${notification.type}`}>
                <div className="notification-content">
                  {getIconByType(notification.type)}
                  <div className="message">{notification.message}</div>
                  <small className="timestamp">{timeSince(notification.time)}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
