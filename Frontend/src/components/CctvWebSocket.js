import { useEffect } from 'react';
import Swal from 'sweetalert2';
import webSocketService from '../websocketService'; // 웹소켓 서비스 임포트

const CctvWebSocket = () => {

    const cctvAddresses = [
        "http://localhost:8000/video_feed",
        "http://localhost:8000/video_feed",
        "http://localhost:8000/video_feed",
        "http://localhost:8000/video_feed",
      ];
    
      const videoUrl = cctvAddresses[0];

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    
    // 웹소켓 연결
    webSocketService.connect(token);

    // 메시지 수신 시 처리할 로직
    const handleMessage = (data) => {
      if (data.type === 'alert') {
        Swal.fire({
          title: '흉기거수자 확인!!',
          text: '알림이 갔습니다.',
          imageUrl: 'img/hyo1.PNG',
          imageWidth: 400,
          imageHeight: 200,
          imageAlt: 'Custom image',
          confirmButtonText: '트래킹모드',
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false
        }).then(result => {
          if (result.isConfirmed) {
            triggerTrackingMode();
          }
        });
      }
    };

    // 웹소켓 메시지 리스너 추가
    webSocketService.addListener(handleMessage);

    return () => {
      // 컴포넌트 언마운트 시 리스너 제거 및 웹소켓 닫기
      webSocketService.removeListener(handleMessage);
      webSocketService.close();
    };
  }, []);

  const triggerTrackingMode = () => {
    Swal.fire({
      width: '70%',
      title: '<strong>트래킹모드</strong>',
      html:
        '<h6>버튼을 클릭하면 꺼집니다.</h6>' +
        `<img src="${videoUrl}" alt="Video Stream" style="width: 80%; height: auto;"/>`,
      confirmButtonText: '확인',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    });
  };
};

export default CctvWebSocket;