import Swal from 'sweetalert2';
import useWebSocket from '../Hooks/useWebSocket';

const CctvWebSocket = () => {
  const token = localStorage.getItem('jwtToken');

  // 웹소켓 메시지 처리 함수
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
      }).then(result => {
        if (result.isConfirmed) {
          Swal.fire({
            width: '70%',
            title: '<strong>트래킹모드</strong>',
            html:
              '<h6>버튼을 클릭하면 꺼집니다.</h6>' +
              `<img src="http://localhost:8000/video_feed" alt="Video Stream" style="width: 80%; height: auto;"/>`,
            confirmButtonText: '확인',
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        }
      });
    }
  };

  // 커스텀 훅 사용하여 WebSocket 연결 및 메시지 처리
  useWebSocket(token, handleMessage);

  return null; // UI 렌더링 없음
};

export default CctvWebSocket;