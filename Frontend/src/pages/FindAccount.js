import React, { useState } from 'react';
import axios from 'axios';
import '../css/FindAccount.css';

const FindAccount = () => {
  const [idName, setIdName] = useState('');
  const [idPhoneNumber, setIdPhoneNumber] = useState('');
  const [passwordUsername, setPasswordUsername] = useState('');
  const [passwordPhoneNumber, setPasswordPhoneNumber] = useState('');

  // Axios 기본 경로 설정
  axios.defaults.baseURL = 'http://localhost:5000'; 
    
  // 아이디 찾기 핸들러
  const handleFindId = async () => {
    console.log('아이디 찾기 입력값:', { idName, idPhoneNumber }); // 입력값 확인

    if (!idName || !idPhoneNumber) {
      alert('이름과 휴대폰 번호를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('/find/id', {
        mem_name: idName,
        phone_number: idPhoneNumber,
      });
      console.log('아이디 찾기 응답:', response.data); // 응답 확인
      alert(`아이디는 ${response.data.username} 입니다.`);
    } catch (error) {
      console.error('아이디 찾기 오류:', error); // 오류 확인
      if (error.response && error.response.status === 404) {
        alert('일치하는 사용자를 찾을 수 없습니다.');
      } else {
        alert('아이디 찾기에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 비밀번호 재설정 핸들러
  const handleResetPassword = async () => {
    console.log('비밀번호 재설정 입력값:', { passwordUsername, passwordPhoneNumber }); // 입력값 확인

    if (!passwordUsername || !passwordPhoneNumber) {
      alert('아이디와 휴대폰 번호를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('/find/password', {
        username: passwordUsername,
        phone_number: passwordPhoneNumber,
      });
      console.log('비밀번호 재설정 응답:', response.data); // 응답 확인
      alert(`임시 비밀번호는 ${response.data.tempPassword} 입니다.`);
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error); // 오류 확인
      if (error.response && error.response.status === 404) {
        alert('일치하는 사용자를 찾을 수 없습니다.');
      } else {
        alert('비밀번호 재설정에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="find-account-container">
      <div className="find-id-password-section">
        {/* 아이디 찾기 */}
        <div className="find-box">
          <h2>아이디 찾기</h2>
          <input
            type="text"
            placeholder="이름을 입력하세요."
            value={idName}
            onChange={(e) => setIdName(e.target.value)}
          />
          <input
            type="text"
            placeholder="회원가입시 입력한 휴대폰 번호를 입력하세요."
            value={idPhoneNumber}
            onChange={(e) => setIdPhoneNumber(e.target.value)}
          />
          <button onClick={handleFindId}>아이디 찾기</button>
        </div>

        {/* 비밀번호 재설정 */}
        <div className="find-box">
          <h2>비밀번호 재설정</h2>
          <input
            type="text"
            placeholder="아이디를 입력하세요."
            value={passwordUsername}
            onChange={(e) => setPasswordUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="회원가입시 입력한 휴대폰 번호를 입력하세요."
            value={passwordPhoneNumber}
            onChange={(e) => setPasswordPhoneNumber(e.target.value)}
          />
          <button onClick={handleResetPassword}>비밀번호 재설정</button>
        </div>
        <a href="/" className="login-link">로그인</a>
      </div>
    </div>
  );
};

export default FindAccount;
