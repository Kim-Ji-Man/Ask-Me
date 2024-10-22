import {
  faStore,
  faMapMarkerAlt,
  faIdBadge,
  faPhoneAlt
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "../axios";
import React, { useState } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useContext } from 'react';

import "../css/Login.css";
import Swal from "sweetalert2";

import "../css/RegisterStore.css";
import { Appdata } from "../App";

function RegisterStore() {
  const navigate = useNavigate();
  const { store, setStore } = useContext(Appdata);
  const [formData, setFormData] = useState({
    store_name: "",
    store_address: "",
    business_number: "",
    store_phone: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

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

    const storeData = {
      store_name: formData.store_name,
      store_address: formData.store_address,
      business_number: formData.business_number,
      store_phone: formData.store_phone,
    };

    setStore(storeData);
    console.log("회원가입 성공");
    // navigate("/");
  };

  console.log(store);

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
