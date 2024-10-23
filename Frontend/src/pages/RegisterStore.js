import {
  faStore,
  faMapMarkerAlt,
  faIdBadge,
  faPhoneAlt
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "../axios";
import React, { useEffect, useState, useContext } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Appdata } from "../App";
import "../css/Login.css";
import "../css/RegisterStore.css";

function RegisterStore() {
  const navigate = useNavigate();
  const { store, setStore } = useContext(Appdata);
  const data = useContext(Appdata);
  const [formData, setFormData] = useState({
    store_name: "",
    store_address: "",
    business_number: "",
    store_phone: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  // 로그인 확인 useEffect 추가
  useEffect(() => {
    if (!data.user || Object.keys(data.user).length === 0) {
      Swal.fire({
        icon: "warning",
        text: "회원가입 페이지로 이동합니다. ",
        confirmButtonText: "확인",
      }).then(() => {
        navigate("/RegisterUser"); // 로그인 페이지로 리다이렉트
      });
    }
  }, [data.user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.store_name.trim()) {
      Swal.fire({
        icon: "error",
        text: "매장명을 입력해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!formData.store_address.trim()) {
      Swal.fire({
        icon: "error",
        text: "매장 주소를 입력해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!formData.business_number.trim()) {
      Swal.fire({
        icon: "error",
        text: "사업자번호를 입력해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!formData.store_phone.trim()) {
      Swal.fire({
        icon: "error",
        text: "매장 전화를 입력해주세요.",
        confirmButtonText: "확인",
      });
      return;
    }

    // Kakao Map API를 사용하여 위도와 경도를 가져오는 함수
    const getCoordinates = (address) => {
      return new Promise((resolve, reject) => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(address, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const lat = result[0].y; // 위도
            const lng = result[0].x; // 경도
            resolve({ lat, lng });
          } else {
            reject(new Error("주소 검색에 실패했습니다."));
          }
        });
      });
    };

  
    

    try {
      const coordinates = await getCoordinates(formData.store_address);
      console.log( coordinates.lat,'위도');
      console.log( coordinates.lng,'경도');
      const storeData = {
        name: formData.store_name,
        address: formData.store_address,
        business_number: formData.business_number,
        phone_number: formData.store_phone,
        latitude: coordinates.lat, // 위도
        longitude: coordinates.lng, // 경도
      };

      setStore(storeData);
      console.log("회원가입 성공");

      // 1. 사용자 등록 (user 데이터)
      const userResponse = await axios.post("/auth/register", data.user, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("User 등록 완료:", userResponse.data.user_id);

      // 2. 매장 등록 (store 데이터)
      storeData.user_id = userResponse.data.user_id; // 사용자와 매장을 연결하기 위한 user_id
      console.log(storeData,"나오니??");
      
      const storeResponse = await axios.post("/auth/stores", storeData,{
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Store 등록 완료:", storeResponse.data);

      // 스토어 정보를 상태로 업데이트
      setStore(storeData);

      // 성공 알림 및 페이지 이동
      Swal.fire({
        icon: "success",
        text: "회원가입 및 매장 등록이 완료되었습니다.",
        confirmButtonText: "확인",
      }).then(() => {
        navigate("/"); // 메인 페이지로 이동
      });
    } catch (error) {
      console.error("등록 중 오류 발생:", error);
      Swal.fire({
        icon: "error",
        text: error.message || "회원가입 중 오류가 발생했습니다.",
        confirmButtonText: "확인",
      });
    }
  };

  return (
    <>
      <Row className="mt-5"></Row>
      <div className="register-pag my-5">
        <Container className="my-5">
          <Row className="justify-content-md-center">
            <Col md={6} className="login-form-container">
              <div className="text-center mb-2">
                <img
                  src="/img/AskMeLogo1.png"
                  alt="Read Fit 로고"
                  className="login-logo"
                />
              </div>
              <Form onSubmit={handleSubmit}>
                {/* 매장명 입력 필드 */}
                <InputGroup className="mb-3">
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faStore} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="매장명"
                    name="store_name"
                    value={formData.store_name}
                    onChange={handleInputChange}
                  />
                </InputGroup>

                {/* 매장 주소 입력 필드 */}
                <InputGroup className="mb-3">
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="매장 주소"
                    name="store_address"
                    value={formData.store_address}
                    onChange={handleInputChange}
                  />
                </InputGroup>

                {/* 사업자번호 입력 필드 */}
                <InputGroup className="mb-3">
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faIdBadge} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="사업자번호"
                    name="business_number"
                    value={formData.business_number}
                    onChange={handleInputChange}
                  />
                </InputGroup>

                {/* 매장 전화 입력 필드 */}
                <InputGroup className="mb-3">
                  <InputGroup.Text>
                    <FontAwesomeIcon icon={faPhoneAlt} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="매장 전화번호"
                    name="store_phone"
                    value={formData.store_phone}
                    onChange={handleInputChange}
                  />
                </InputGroup>

                <Button
                  variant="success"
                  type="submit"
                  className="login-button mb-3"
                >
                  회원가입
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default RegisterStore;
