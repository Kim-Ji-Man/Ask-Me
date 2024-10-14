import React from 'react';
import '../css/MyPage.css'; 

const MyPage = () => {
  return (
    <div className="containermy  mt-5">
      {/* 내 정보 섹션 */}
      <div className="section mt-3">
        <h3 className="section-title">내 정보</h3>
        <div className="input-row">
          <label className="label">이름</label>
          <input type="text" value="홍길동" className="input" />
        </div>
        <div className="input-row">
          <label className="label">휴대폰 번호</label>
          <input type="text" value="010-1234-5678" className="input" />
        </div>
        <div className="input-row">
          <label className="label">사업자 번호</label>
          <input type="text" value="000-00-12345" className="input" disabled />
        </div>
        <div className="input-row">
          <label className="label">아이디</label>
          <input type="email" value="1q2w3e@getnada.com" className="input" disabled />
        </div>
        <div className="input-row">
          <label className="label">주소</label>
          <input type="text" value="광주광역시 동구 제봉로 92 " className="input" disabled />
        </div>

        <div className="input-row">
          <label className="label">마케팅 정보 수신 설정</label>
          <div>
            <label>
              <input type="radio" name="marketing" value="동의" /> 동의
            </label>
            <label style={{ marginLeft: '20px' }}>
              <input type="radio" name="marketing" value="동의 안 함" /> 동의 안 함
            </label>
          </div>
        </div>
        <div className="button-row">
          <button className="cancel-button">취소</button>
          <button className="save-button">저장</button>
        </div>
      </div>

      {/* 비밀번호 변경 섹션 */}
      <div className="section">
        <h3 className="section-title">비밀번호</h3>
        <div className="input-row">
          <label className="label">현재 비밀번호</label>
          <input type="password" placeholder="영어, 숫자 또는 특수문자 조합 20자 이내" className="input" />
        </div>
        <div className="input-row">
          <label className="label">새 비밀번호</label>
          <input type="password" placeholder="영어, 숫자 또는 특수문자 조합 20자 이내" className="input" />
        </div>
        <div className="input-row">
          <label className="label">새 비밀번호 확인</label>
          <input type="password" placeholder="영어, 숫자 또는 특수문자 조합 20자 이내" className="input" />
        </div>
        <div className="button-row">
          <button className="cancel-button">취소</button>
          <button className="save-button">저장</button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
