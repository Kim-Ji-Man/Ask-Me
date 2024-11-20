import React, { useEffect, useState } from 'react';
import { Col, Container, Row, Image, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axios';
import '../css/Login.css';
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add('login-page'); // 로그인 페이지에서 body 클래스 추가

    // 컴포넌트 언마운트 시 클래스 제거
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (username === "" || password === "") {
      Swal.fire({
        icon: 'warning',
        title: '입력 오류',
        text: '아이디와 비밀번호를 모두 입력해 주세요.',
        confirmButtonText: '확인'
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post('/auth/login', {
        username: username,
        password: password
      });

      if (res.data.success) {
        // 로그인 성공 시 localStorage에 토큰 저장
        localStorage.setItem('userId', res.data.userId); 
        localStorage.setItem('username', res.data.username); 
        localStorage.setItem('jwtToken', res.data.token);
        localStorage.setItem('role', res.data.role); 

        Swal.fire({
          icon: 'success',
          title: '로그인 성공!',
          text: `${username}님 반갑습니다!`,
          confirmButtonText: '확인'
        });
        
        if (res.data.role === 'master') {
          navigate("/MainMaster"); // 관리자 페이지로 이동
        } else {
          navigate("/cctv"); // 일반 사용자 페이지로 이동
        } 
      } else {
        throw new Error('로그인 실패');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Swal.fire({
        icon: 'error',
        title: '로그인 실패',
        text: '아이디 및 비밀번호가 틀렸습니다.',
        confirmButtonText: '확인'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-contents">
      <Container className='mt-5'>
        <Row className='mt-3 mb-3'>
          <Col md={6} className='d-flex justify-content-center align-items-center g-0'>
            <Image src="/img/office.jpg" alt="Login Image" className="login-image" fluid />
          </Col>
          <Col md={6} xs={12} className='d-flex justify-content-left titles g-0'>
            <Form className='loginForm' style={{ width: '100%' }} onSubmit={handleLogin}>
              <Row>
                <Col>
                  <Image src='img/AskMeLogo1.png' style={{ width: '100%' ,height:'200px',marginBottom:"25px"}} />
                </Col>
              </Row>
              {/* <Row>
                <Col style={{marginBottom:"25px"}}>
                  <p style={{fontSize:"2.0rem"}}>로그인</p>
                </Col>
              </Row> */}
              <Row>
                <Col>
                  <input
                    type="text"
                    className="userId"
                    id="userId"
                    placeholder="아이디"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Col>
              </Row>
              <Row>
                <Col className='logbtncol'>
                  <input
                    type="password"
                    className="password"
                    id="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <button id="loginBut" type="submit" disabled={isLoading}>
                    {isLoading ? '로그인 중...' : '로그인'}
                  </button>
                </Col>
              </Row>
              <div className="link">
                <Link to={"/Findaccount"}>아이디ㆍ비밀번호 찾기</Link>
                <span className="vertical-line"></span>
                <Link to={"/RegisterUser"}>회원가입</Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;