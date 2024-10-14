import React from 'react';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBInput,
  MDBIcon,
  MDBCheckbox
} from 'mdb-react-ui-kit';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Register() {
  return (
    <MDBContainer fluid className="p-5">

      <MDBCard className='text-black' style={{borderRadius: '25px'}}>
        <MDBCardBody>
          <MDBRow>

            {/* 회원가입 폼 */}
            <MDBCol md='10' lg='6' className='order-2 order-lg-1 d-flex flex-column align-items-center'>

              <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">회원가입</p>

              <div className="d-flex flex-row align-items-center mb-4">
                <MDBIcon fas icon="user" className="me-3" size='lg' />
                <MDBInput placeholder='이름' id='form1' type='text' className='w-100'/>
              </div>

              <div className="d-flex flex-row align-items-center mb-4">
                <MDBIcon fas icon="envelope" className="me-3" size='lg' />
                <MDBInput placeholder='아이디(이메일)' id='form2' type='email'/>
              </div>

              <div className="d-flex flex-row align-items-center mb-4">
                <MDBIcon fas icon="lock" className="me-3" size='lg'/>
                <MDBInput placeholder='비밀번호' id='form3' type='password'/>
              </div>

              <div className="d-flex flex-row align-items-center mb-4">
                <MDBIcon fas icon="key" className="me-3" size='lg'/>
                <MDBInput placeholder='비밀번호 확인' id='form4' type='password'/>
              </div>

              <div className="d-flex flex-row align-items-center mb-4">
                <MDBIcon fas icon="phone" className="me-3" size='lg' />
                <MDBInput placeholder='휴대폰 번호' id='form2' type='text'/>
              </div>

              <div className="d-flex flex-row align-items-center mb-4">
                <MDBIcon fas icon="file" className="me-3" size='lg' />
                <MDBInput placeholder='사업자 번호' id='form2' type='text'/>
              </div>

              <div className="d-flex flex-row align-items-center mb-4">
               <MDBIcon fas icon="building" className="me-3" size='lg'/>
               <MDBInput placeholder='사업자 주소' id='form2' type='text' />
              </div>


              <div className='mb-4'>
                <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='서비스 이용에 동의합니다.' />
              </div>

              <MDBBtn style={{ width: '150px', height: '50px', padding: '10px 20px', transition: 'none', backgroundColor: 'skyblue', color: 'white', border: 'none'}} className='mb-4' size='lg'>가입하기</MDBBtn>
              <div className="text-center">
                  <p>이미 가입이 되어있으신가요?
                  <a href="/" className="text-decoration-none ms-1">로그인</a>
                  </p>
          </div>
            </MDBCol>

            {/* 이미지 섹션 */}
            <MDBCol md='10' lg='6' className='order-1 order-lg-2 d-flex align-items-center'>
              <MDBCardImage src="/img/office.jpg" fluid style={{borderRadius: '25px'}}/>
            </MDBCol>

          </MDBRow>
        </MDBCardBody>
      </MDBCard>

    </MDBContainer>
  );
}

export default Register;
