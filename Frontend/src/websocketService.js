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

    // 이미 연결된 WebSocket이 있으면 새로운 연결을 하지 않음
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log("이미 연결된 WebSocket이 있습니다.");
      return;
    }

    this.socket = new WebSocket(`wss://localhost:5000?token=${token}`);

    this.socket.onopen = () => {
      console.log("WebSocket 연결 성공");
    };

    this.socket.onerror = (event) => {
      console.error("WebSocket 오류:", event.message || event);
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("수신한 데이터:", data);

      // 등록된 모든 리스너들에게 메시지를 전달
      this.listeners.forEach((listener) => {
        if (typeof listener === 'function') {
          listener(data);
        } else {
          console.error('리스너가 함수가 아닙니다:', listener);
        }
      });
    };

    let reconnectAttempts = 0;
    const maxReconnectDelay = 16000; // 최대 지연 시간
    
    this.socket.onclose = () => {
      console.log("WebSocket 연결 종료, 재연결 시도 중...");
      
      let reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), maxReconnectDelay); // 지수 백오프 계산
      
      setTimeout(() => {
        reconnectAttempts++;
        this.connect(token);
      }, reconnectDelay);
    };
  }

  // 메시지 리스너 추가
  addListener(listener) {
    if (typeof listener !== 'function') {
      console.error('리스너는 반드시 함수여야 합니다.');
      return;
    }
    this.listeners.push(listener);
  }

  // 메시지 리스너 제거
  removeListener(listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  close() {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      this.socket.close();
      console.log("WebSocket 연결 종료");
    }
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;