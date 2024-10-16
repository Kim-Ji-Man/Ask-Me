import React, { useEffect, useState } from 'react';
import { Col, Container, Row, Image, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import '../css/Login.css';
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.body.classList.add('login-page'); // 로그인 페이지에서 body 클래스 추가

    // 컴포넌트 언마운트 시 클래스 제거
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleLogin = async (event) => {
  event.preventDefault(); // 폼 제출 시 페이지 리프레시 방지

  try {
    const res = await axios.post('http://localhost:5000/auth/login', {
      email: username,
      password: password
    });

    // 응답에서 success 필드 확인
    if (res.data.success) {
      // 로그인 성공 시 토큰 저장
      localStorage.setItem('token', res.data.token); // 필요한 경우
      navigate("/CCTV");
      Swal.fire({
        icon: 'success',
        title: '로그인 성공!',
        text: `${username}님 반갑습니다!`,
        confirmButtonText: '확인'
      });
    } 
  } catch (error) {
    console.error('Error during login:', error);
    Swal.fire({
      icon: 'error',
      title: '로그인 실패',
      text: '아이디 및 비밀번호가 틀렸습니다',
      confirmButtonText: '확인'
    });
  }
};

  return (
    <div className="main-contents">
      <Container className='mt-5'>
        <Row className='mt-3 mb-3 '>
          <Col md={6} className='d-flex justify-content-center align-items-center g-0'>
            <Image src="/img/office.jpg" alt="Login Image" className="login-image" fluid />
          </Col>
          <Col md={6} xs={12} className='d-flex justify-content-left titles g-0'>
            <Form className='loginForm' style={{ width: '100%' }} onSubmit={handleLogin}>
              <Row>
                <Col>
                  <Image src='img/loginlogo.png' style={{ width: '90%' }} />
                </Col>
              </Row>
              <Row>
                <Col>
                  <input type="text" className="userId" id="userId" placeholder="아이디" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} />
                </Col>
              </Row>
              <Row>
                <Col className='logbtncol'>
                  <input type="password" className="password" id="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Col>
              </Row>
              <Row>
                <Col>
                  <button id="loginBut">로그인</button>
                </Col>
              </Row>
              <div className="link">
                <Link to={"/Findaccount"}>아이디ㆍ비밀번호 찾기</Link>
                <span className="vertical-line"></span>
                <Link to={"/Register"}>회원가입</Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login;