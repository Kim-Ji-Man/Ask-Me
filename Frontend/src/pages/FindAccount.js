import React from 'react';
import '../css/FindAccount.css';

const FindAccount = () => {
  return (
    <div className="find-account-container">
      <div className="find-id-password-section">
        {/* 아이디 찾기 */}
        <div className="find-box">
          <h2>아이디 찾기</h2>
          <input type="text" placeholder="이름을 입력하세요." />
          <input type="email" placeholder="회원가입시 입력한 휴대폰 번호를 입력하세요." />
          <button>아이디 찾기</button>
        </div>
        
        {/* 비밀번호 찾기 */}
        <div className="find-box">
          <h2>비밀번호 찾기</h2>
          <input type="text" placeholder="아이디를 입력하세요." />
          <input type="email" placeholder="회원가입시 입력한 휴대폰 번호를 입력하세요." />
          <button>비밀번호 찾기</button>
        </div>
        <a href="/" className="login-link">로그인</a>
      </div>
    </div>
  );
};

export default FindAccount;
