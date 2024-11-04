import { useEffect } from 'react';
import webSocketService from '../websocketService'; // 웹소켓 서비스 임포트

// 커스텀 훅: WebSocket 연결 및 메시지 처리
const useWebSocket = (token, handleMessage) => {
  useEffect(() => {
    if (!token) {
      console.error("JWT 토큰이 없습니다.");
      return;
    }

    // 웹소켓 연결
    webSocketService.connect(token);

    // 메시지 리스너 추가
    webSocketService.addListener(handleMessage);

    // 컴포넌트 언마운트 시 리스너 제거 및 웹소켓 닫기
    return () => {
      webSocketService.removeListener(handleMessage);
      webSocketService.close();
    };
  }, [token, handleMessage]);
};

export default useWebSocket;