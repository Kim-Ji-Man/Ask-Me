import React, { useEffect, useState } from 'react';
import '../css/MyPage.css'; 
import axios from '../axios';
import Swal from "sweetalert2";

const MyPage = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    email: '',
    businessNumber: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username] = useState(localStorage.getItem('username') || ''); // 로컬 스토리지에서 사용자명 가져오기
  const [initialUserInfo, setInitialUserInfo] = useState({}); // 초기 값을 저장

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    setLoading(true);
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('jwtToken');
  
    try {
      const response = await axios.get(`/mypage/info/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      const storeResponse = await axios.get(`/auth/stores/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const fetchedUserInfo = {
        name: response.data.mem_name,
        phone: response.data.phone_number,
        email: response.data.email,
        businessNumber: storeResponse.data.business_number || '',
        address: storeResponse.data.address || ''
      };
  
      setUserInfo(fetchedUserInfo);
      setInitialUserInfo(fetchedUserInfo); // 초기값을 여기에서 설정
    } catch (error) {
      console.error('사용자 정보를 가져오는 중 오류 발생:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: error.response?.data?.message || '사용자 정보를 불러오는 데 실패했습니다.',
        confirmButtonText: '확인'
      });
    } finally {
      setLoading(false);
    }
  };  

  // 취소, 초기값
  const handleCancel = () => {
    Swal.fire({
      title: '정말로 초기화 하시겠습니까?',
      text: '변경한 내용은 모두 사라집니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setUserInfo(initialUserInfo); // 초기값으로 되돌림
      }
    });
  };


  // 사용자 정보 저장 함수
  const handleSave = async () => {
    const token = localStorage.getItem('jwtToken');

    try {
      const response = await axios.put(`/auth/update`, {
        email: userInfo.email,
        phone_number: userInfo.phone,
        mem_name: userInfo.name,
        store: {
          address: userInfo.address,
          business_number: userInfo.businessNumber
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: '정보 수정 성공',
          text: '사용자 정보가 성공적으로 수정되었습니다.',
          confirmButtonText: '확인'
        });
        window.location.reload(); // 새로고침
      } else {
        throw new Error('정보 수정 실패');
      }
    } catch (error) {
      console.error('정보 수정 중 오류 발생:', error);
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: error.response?.data?.message || '정보 수정 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    }
  };
  const handlePasswordChange = async (event) => {
    event.preventDefault();
  
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: '비밀번호 변경 실패',
        text: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
        confirmButtonText: '확인'
      });
      return;
    }
  
    if (newPassword.length < 4) {
      Swal.fire({
        icon: 'warning',
        title: '비밀번호 변경 실패',
        text: '새 비밀번호는 최소 4자 이상이어야 합니다.',
        confirmButtonText: '확인'
      });
      return;
    }
  
    const token = localStorage.getItem('jwtToken');
  
    try {
      const response = await axios.post('/find/change-password', {
        username,
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      // API의 성공 여부를 확인
        if (response.data.success) {
            Swal.fire({
                icon: 'success',
                title: '비밀번호 변경 성공',
                text: response.data.message,
                confirmButtonText: '확인'
            });
            // 입력 필드 초기화
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            // 여기서 API 응답이 실패로 온 경우 처리
            Swal.fire({
                icon: 'error',
                title: '비밀번호 변경 실패',
                text: response.data.message || '비밀번호 변경이 실패했습니다.',
                confirmButtonText: '확인'
            });
        }
    } catch (error) {
        console.error('비밀번호 변경 중 오류 발생:', error);
        Swal.fire({
            icon: 'error',
            title: '오류',
            text: error.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.',
            confirmButtonText: '확인'
        });
    }
  };
  
  return (
    <div className="containermy mt-5">
      {/* 내 정보 섹션 */}
      <div className="section mt-3">
        <h3 className="section-title">내 정보</h3>
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <>
            <div className="input-row">
              <label className="label">이름</label>
              <input
                type="text"
                value={userInfo.name}
                className="input"
                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              />
            </div>
            <div className="input-row">
              <label className="label">휴대폰 번호</label>
              <input
                type="text"
                value={userInfo.phone}
                className="input"
                onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
              />
            </div>
            <div className="input-row">
              <label className="label">사업자 번호</label>
              <input type="text" value={userInfo.businessNumber} className="input" disabled />
            </div>
            <div className="input-row">
              <label className="label">이메일</label>
              <input
                type="email"
                value={userInfo.email}
                className="input"
                onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
              />
            </div>
            <div className="input-row">
              <label className="label">주소</label>
              <input
                type="text"
                value={userInfo.address}
                className="input"
                onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
              />
            </div>
          </>
        )}
        
        <div className="button-row">
          <button className="cancel-button" onClick={handleCancel}>초기화</button>
          <button className="save-button" onClick={handleSave}>수정</button>
        </div>
      </div>

      {/* 비밀번호 변경 섹션 */}
      <div className="section">
        <h3 className="section-title">비밀번호</h3>
        <form onSubmit={handlePasswordChange}>
          
          <div className="input-row">
            <label className="label">현재 비밀번호</label>
            <input
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="input-row">
            <label className="label">새 비밀번호</label>
            <input
              type="password"
              placeholder="영어, 숫자 또는 특수문자 조합 20자 이내"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-row">
            <label className="label">새 비밀번호 확인</label>
            <input
              type="password"
              placeholder="영어, 숫자 또는 특수문자 조합 20자 이내"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="button-row">
            <button 
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              초기화
            </button>
            <button className="save-button" type="submit">수정</button>
          </div>
        </form>
      </div>
      </div>

  );
};

export default MyPage;
