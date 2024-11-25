import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import useWebSocket from '../Hooks/useWebSocket'; // 커스텀 훅 임포트
import axios from 'axios';

const CctvWebSocket = () => {
  const [captureImage, setCaptureImage] = useState(null); // 캡처된 이미지 상태
  const [videoUrl, setVideoUrl] = useState("https://localhost:8000/video_feed2"); // 비디오 스트림 URL
  const [isRecording, setIsRecording] = useState(false); // 녹화 상태
  const token = localStorage.getItem('jwtToken'); // 로컬 스토리지에서 JWT 토큰 가져오기

  // 웹소켓 메시지 처리 함수
  const handleMessage = async (data) => {
    if (data.type === 'alert') {
      if (localStorage.getItem('aaa') === 'true') {
        console.log('이미지 캡처 비활성화됨');
        return; // 조건을 만족하면 함수 종료
      }
      
      try {
        // 이미지 캡처 API 호출
        const response = await axios.get("https://localhost:8000/capture_image", {
          responseType: 'blob'
        });
        const imageBlob = response.data;
        const imageUrl = URL.createObjectURL(imageBlob); // Blob 데이터를 URL로 변환
        setCaptureImage(imageUrl); // 캡처된 이미지 상태 업데이트

        // 알림 표시
        Swal.fire({
          title: '흉기거수자 확인!',
          text: '알림이 전송되었습니다.',
          imageUrl: imageUrl, // 캡처된 이미지 사용
          imageWidth: 400,
          imageHeight: 200,
          imageAlt: '캡처된 이미지',
          confirmButtonText: '트래킹 모드',
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false
        }).then(result => {
          if (result.isConfirmed) {
            // 트래킹 모드 시작
            localStorage.setItem('startTrackingMode', 'true');
            window.location.reload(); // 페이지 새로 고침
            localStorage.setItem('aaa', 'true');
          }
        });
      } catch (error) {
        console.error("이미지 캡처 실패:", error);
      }
    }
  };

  // 웹소켓 훅에서 웹소켓 메시지 수신
  useWebSocket(handleMessage); // `useWebSocket` 훅에서 메시지 처리

  // 트래킹 모드 알림
  const triggerTrackingMode = () => {
    const videoUrlWithRecord = `${videoUrl}?record=true`; // record=true로 URL 설정
  
    Swal.fire({
      width: '70%',
      title: '<strong>트래킹 모드</strong>',
      html: `
        <h6>실시간 감지된 비디오 스트리밍</h6>
        <img id="video-stream" src="${videoUrlWithRecord}" autoPlay muted style="width: 80%; height: auto;"/>
      `,
      confirmButtonText: '녹화 종료',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    }).then(() => {
      localStorage.removeItem('aaa'); // 값 제거
      window.location.reload(); // 페이지 새로 고침
    });
  };

  // 페이지 로드 후 트래킹 모드 시작
  useEffect(() => {
    const isTrackingMode = localStorage.getItem('startTrackingMode') === 'true';

    if (isTrackingMode) {
      triggerTrackingMode(); // 트래킹 모드 시작
      setIsRecording(true); // 녹화 시작
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
      <video id="video-stream" src={videoUrl} autoPlay muted style={{ width: '100%', height: 'auto' }} />
    </div>
  );
};

export default CctvWebSocket;