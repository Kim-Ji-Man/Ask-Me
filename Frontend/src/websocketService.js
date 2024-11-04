// websocketService.js
class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = [];
  }

  connect(token) {
    if (!token) {
      console.error("JWT 토큰이 없습니다.");
      return;
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("이미 연결된 WebSocket이 있습니다.");
      return;
    }

    this.socket = new WebSocket(`ws://localhost:5000?token=${token}`);

    this.socket.onopen = () => {
      console.log("WebSocket 연결 성공");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket 오류:", error);
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("수신한 데이터:", data);

      // 등록된 모든 리스너들에게 메시지를 전달
      this.listeners.forEach((listener) => listener(data));
    };

    this.socket.onclose = () => {
      console.log("WebSocket 연결 종료, 5초 후 재연결 시도");
      setTimeout(() => this.connect(token), 5000); // 재연결 시도
    };
  }

  // 메시지 리스너 추가
  addListener(listener) {
    this.listeners.push(listener);
  }

  // 메시지 리스너 제거
  removeListener(listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  close() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;