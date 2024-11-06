import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import useWebSocket from '../Hooks/useWebSocket'; // 커스텀 훅 임포트
import axios from 'axios';

const CctvWebSocket = () => {
  const [captureImage, setCaptureImage] = useState(null);
  const [videoUrl, setVideoUrl] = useState("http://localhost:8000/video_feed2");
  const token = localStorage.getItem('jwtToken');

  // 웹소켓 메시지 처리 함수
  const handleMessage = async (data) => {
    if (data.type === 'alert') {
      try {
        // 이미지 캡처 API 호출
        const response = await axios.get("http://localhost:8000/capture_image", {
          responseType: 'blob'
        });
        const imageBlob = response.data;
        const imageUrl = URL.createObjectURL(imageBlob);
        setCaptureImage(imageUrl);

        // 알림 표시
        Swal.fire({
          title: '흉기거수자 확인!',
          text: '알림이 전송되었습니다.',
          imageUrl: imageUrl,
          imageWidth: 400,
          imageHeight: 200,
          imageAlt: '캡처된 이미지',
          confirmButtonText: '트래킹 모드',
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false
        }).then(result => {
          if (result.isConfirmed) {
            // 로컬 스토리지에 값 저장
            localStorage.setItem('startTrackingMode', 'true');
            window.location.reload(); // 페이지 새로 고침
          }
        });
      } catch (error) {
        console.error("이미지 캡처 실패:", error);
      }
    }
  };

  // 트래킹 모드 알림
  const triggerTrackingMode = () => {
    Swal.fire({
      width: '70%',
      title: '<strong>트래킹 모드</strong>',
      html: `
        <h6></h6>
        <img src="${videoUrl}" alt="Video Stream" style="width: 80%; height: auto;"/>
      `,
      confirmButtonText: '확인',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    })
  };

   // 페이지 로드 후 트래킹 모드 시작
   useEffect(() => {
    if (localStorage.getItem('startTrackingMode') === 'true') {
      triggerTrackingMode(); // 트래킹 모드 시작
      localStorage.removeItem('startTrackingMode'); // 값 제거
    }
  }, []);

  // 커스텀 훅 사용하여 WebSocket 연결 및 메시지 처리
  useWebSocket(token, handleMessage);

  return (
    <div>
      {captureImage && (
        <div style={{ display: 'none' }}>
          <img src={captureImage} alt="Captured frame" />
        </div>
      )}
      <video src={videoUrl} autoPlay style={{ width: '100%', height: 'auto' }} />
    </div>
  );
};

export default CctvWebSocket;