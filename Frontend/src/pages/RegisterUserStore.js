import React, { useState } from 'react';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBRadio,
  MDBCheckbox
}
from 'mdb-react-ui-kit';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Form } from "react-bootstrap";
import "../css/Register.css";



function RegisterUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mem_name: "",
    mem_id: "",
    mem_birth: "",
    mem_pw: "",
    confirm_pw: "",
    mem_phone: "",
    mem_email: "",
    mem_busi_number: "",
    mem_busi_address: "",
    mem_gender: "",
  });

  const [isIdValid, setIsIdValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식을 검증하는 정규식

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    // 전화번호 입력시 포맷 적용
    if (name === "mem_phone") {
      setFormData({ ...formData, mem_phone: formatPhoneNumber(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // 아이디 입력시 유효성 검사 및 중복 체크
    if (name === "mem_id") {
      if (!emailRegex.test(value)) {
        setIsIdValid(false);
        setErrorMessage("아이디는 이메일 형식이어야 합니다!");
      } else {
        setIsIdValid(true);
        // 아이디 중복 체크
        try {
          // const response = await axios.get(`/checkId/${value}`);
          const response = { data: "master@gmail.com" }; // 예시 응답
          const isDuplicate = response.data === value;
          setIsIdValid(!isDuplicate); // 중복이 아니면 유효한 아이디로 처리
          setErrorMessage(
            isDuplicate
              ? "이미 사용중인 아이디입니다."
              : "사용 가능한 아이디입니다."
          );
        } catch (error) {
          console.error("아이디 중복 체크 중 오류 발생:", error);
          setErrorMessage("아이디 중복 체크 중 오류가 발생했습니다.");
        }
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // 이메일 형식 유효성 검증
    if (name === "mem_id" && !emailRegex.test(value)) {
      Swal.fire({
        icon: "warning",
        text: "아이디는 이메일 형식이어야 합니다.",
        confirmButtonText: "확인",
      });
      setIsIdValid(false); // 유효성 검사 실패 시 상태 업데이트
    }
  };

  function isPasswordMatching(password, confirmPassword) {
    return password === confirmPassword;
  }

  const handleSubmit = async (e) => {
 

    e.preventDefault();

    if (!isIdValid) {
      Swal.fire({
        icon: "error",
        text: "아이디 중복 확인을 해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }
    if (formData.mem_pw !== formData.confirm_pw) {
      Swal.fire({
        icon: "error",
        text: "비밀번호가 일치하지 않습니다..",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!formData.mem_pw.trim()) {
      Swal.fire({
        icon: "error",
        text: "비밀번호를 입력해주세요",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!formData.confirm_pw.trim()) {
      Swal.fire({
        icon: "error",
        text: "비밀번호 확인을 입력해주세요",
        confirmButtonText: "확인",
      });
      return;
    }
    if (!formData.mem_phone.trim()) {
      Swal.fire({
        icon: "error",
        text: "전화번호를 입력해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!formData.mem_busi_address.trim()) {
      Swal.fire({
        icon: "error",
        text: "사업자주소를 입력해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!formData.mem_busi_number.trim()) {
      Swal.fire({
        icon: "error",
        text: "사업자번호를 입력해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    const userData = {
      mem_id: formData.mem_id,
      mem_pw: formData.mem_pw,
      mem_nick: formData.mem_nick,
      mem_phone: formData.mem_phone,
      mem_email: formData.mem_email,
    };

    try {
      // await axios.post("/register", userData, {
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });
      console.log("회원가입 성공");
      navigate("/");
    } catch (error) {
      console.error("회원가입 실패:", error);
      Swal.fire({
        icon: "error",
        text: "회원가입에 실패하였습니다.",
        confirmButtonText: "확인",
      });
    }
  };

  function formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length < 4) return cleaned;
    const match = cleaned.match(/(\d{3})(\d{4})(\d{4})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : phoneNumber;
  }


  return (
    <MDBContainer fluid className="p-5">

      <MDBRow className='justify-content-center align-items-center m-5'>
      <MDBCol  md="6" sm="12">
        <MDBCard className="w-100">
          <MDBCardBody className='px-4'>

          <Form onSubmit={handleSubmit}>
            <h3 className="fw-bold mb-4 pb-2 pb-md-0 mb-md-5">회원가입</h3>

            <MDBRow>

              <MDBCol md='6'>
                <MDBInput wrapperClass='mb-4' placeholder='아이디(이메일)' size='lg' id='form1' type='email'
                    name="mem_id"
                    onChange={handleInputChange}
                    value={formData.mem_id}
                    onBlur={handleBlur}/>

                <Form.Text
                  className={isIdValid ? "text-success" : "text-danger"}
                >
                  {errorMessage}
                </Form.Text>

              </MDBCol>

              <MDBCol md='6'>
                <MDBInput wrapperClass='mb-4' placeholder='이름' size='lg' id='form2' type='text' 
                    className="w-100"
                    name="mem_name"
                    onChange={handleInputChange}
                    value={formData.mem_name}/>
              </MDBCol>

            </MDBRow>
            
            
            <MDBRow>

              <MDBCol md='6'>
                <MDBInput wrapperClass='mb-4' placeholder='생년월일(6자리)' size='lg' id='form5' type='text' 
                    name="mem_birth"
                    onChange={handleInputChange}
                    value={formData.mem_birth}/>
              </MDBCol>

              <MDBCol md='6' className='mb-4'>
                <h5 className="fw-bold">Gender: </h5>
                <MDBRadio name='mem_gender' id='genderfemale' value="여자" label='Female' onChange={handleInputChange} inline  />
                <MDBRadio name='mem_gender' id='gendermale' value="남자" label='Male' onChange={handleInputChange} inline />
              </MDBCol>

            </MDBRow>



            <MDBRow>

              <MDBCol md='6'>
                <MDBInput wrapperClass='mb-4' placeholder='비밀번호' size='lg' id='form3' type='password'
                    name="mem_pw"
                    onChange={handleInputChange}
                    value={formData.mem_pw}/>
              </MDBCol>

              <MDBCol md='6'>
                <MDBInput wrapperClass='mb-4' placeholder='비밀번호 확인' size='lg' id='form4' type='password'
                    name="confirm_pw"
                    onChange={handleInputChange}
                    value={formData.confirm_pw}/>

                <Form.Text
                  className={
                    formData.mem_pw && formData.confirm_pw
                      ? isPasswordMatching(formData.mem_pw, formData.confirm_pw)
                        ? "text-success"
                        : "text-danger"
                      : ""
                  }
                >
                  {formData.mem_pw && formData.confirm_pw
                    ? isPasswordMatching(formData.mem_pw, formData.confirm_pw)
                      ? "비밀번호가 일치합니다."
                      : "비밀번호가 불일치합니다."
                    : ""}
                </Form.Text>

              </MDBCol>

            </MDBRow>


            <MDBRow>

              <MDBCol md='6'>
                <MDBInput wrapperClass='mb-4' placeholder='전화번호(010-xxxx-xxxxx)' size='lg' id='form6' type='text'
                    name="mem_phone"
                    onChange={handleInputChange}
                    value={formData.mem_phone}
                    maxLength="13"/>
              </MDBCol>

              <MDBCol md='6'>
                <MDBInput wrapperClass='mb-4' placeholder='사업자 번호' size='lg' id='form7' type='text'
                    name="mem_busi_number"
                    onChange={handleInputChange}
                    value={formData.mem_busi_number}/>
              </MDBCol>

            </MDBRow>


            <MDBRow>

              <MDBCol md='12'>
                <MDBInput wrapperClass='mb-5' placeholder='사업자 주소' size='lg' id='form8' type='text'
                    name="mem_busi_address"
                    onChange={handleInputChange}
                    value={formData.mem_busi_address}/>
              </MDBCol>

            </MDBRow>

            <div className="mb-4 flex-center">
                  <MDBCheckbox
                    name="flexCheck"
                    value=""
                    id="flexCheckDefault"
                    label="서비스 이용에 동의합니다."
                  />
            </div>

            <MDBBtn style={{
                    width: "150px",
                    height: "50px",
                    padding: "10px 20px",
                    transition: "none",
                    backgroundColor: "skyblue",
                    color: "white",
                    border: "none",
                  }}
                  className="mb-4"
                  size="lg">가입하기</MDBBtn>


            <div className="text-center">
                  <p>
                    이미 가입이 되어있으신가요?
                    <a href="/" className="text-decoration-none ms-1">
                      로그인
                    </a>
                  </p>
                </div>
          </Form>
          </MDBCardBody>
        </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default RegisterUser;
