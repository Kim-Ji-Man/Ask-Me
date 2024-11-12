import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import PaginatedSearch from '../components/PaginatedSearch';
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import InputGroup from 'react-bootstrap/InputGroup';
import Swal from "sweetalert2";
import "../css/Member.css";
import UserModal from '../components/UserModal';
import axios from "../axios";
import { jwtDecode } from 'jwt-decode';
import CctvWebSocket from"../components/CctvWebSocket"


const Member = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [storeId, setStoreId] = useState(null); // 매장 ID 상태 추가
  const token = localStorage.getItem('jwtToken');
  CctvWebSocket();
  

  useEffect(() => {
  
    if (token) {
      const decodedToken = jwtDecode(token);
  
      // 만료 시간 체크
      if (decodedToken.exp * 1000 < Date.now()) {
        console.log("토큰이 만료되었습니다.");
        return; // 토큰 만료 시 리디렉션 추가
      }
  
      setUserRole(decodedToken.role);
      setStoreId(decodedToken.storeId);
  
      // 사용자 역할이 admin 또는 master인지 확인
      if (decodedToken.role === 'admin' || decodedToken.role === 'master') {
        console.log(decodedToken.storeId);
  
        if (decodedToken.role === 'admin' && decodedToken.storeId) {
          // admin 역할일 때 storeId에 맞는 회원 목록 요청
          axios
            .get(`/Member/guards/all/${decodedToken.storeId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            .then((res) => {
              setMembers(res.data);
              console.log(res.data);
            })
            .catch((error) => {
              console.error("서버 연결 실패:", error.response ? error.response.data : error.message);
            });
        } else if (decodedToken.role === 'master') {
          // master 역할일 때 전체 회원 목록 요청
          axios
            .get(`/Member`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            .then((res) => {
              setMembers(res.data);
              console.log(res.data);
            })
            .catch((error) => {
              console.error("서버 연결 실패:", error.response ? error.response.data : error.message);
            });
        }
      } else {
        console.log("접근 권한이 없습니다.");
      }
    } else {
      console.log("토큰이 없습니다.");
    }
  }, [showModal, storeId]);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 선택된 멤버 초기화 및 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMember(null);
  };

  // 선택한 멤버를 수정할 수 있도록 설정하는 함수
  const editClick = (user_id) => {
    const member = members.find((m) => m.user_id === user_id);
    setSelectedMember(member);
    setShowModal(true);
  };

  // 멤버 삭제하는 함수
  const deleteMember = (user_id) => {
    Swal.fire({
      icon: 'question',
      text: '정말 삭제하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '관리자 비밀번호를 입력하세요',
          input: 'password',
          inputAttributes: {
            autocapitalize: 'off',
            required: 'required',
            minLength: 4
          },
          showCancelButton: true,
          confirmButtonText: '확인',
          cancelButtonText: '취소'
        }).then((passwordResult) => {
          if (passwordResult.isConfirmed) {
            const inputPassword = passwordResult.value;
  
            // 비밀번호 확인 API 호출
            axios.post(
              '/Member/VerifyPassword',
              {
                password: inputPassword, // 입력된 비밀번호
                token: token,            // 토큰 추가
              },
              {
                headers: { Authorization: `Bearer ${token}` } // 헤더에 토큰 추가
              }
            )
            .then((response) => {
              if (response.data.isValid) {  // 비밀번호가 유효한 경우
                axios.delete(`/Member/Delete/${user_id}`)
                  .then(() => {
                    Swal.fire({
                      icon: 'success',
                      text: '계정이 삭제되었습니다.',
                      confirmButtonText: '확인'
                    }).then(() => {
                      window.location.href = '/Member';  // 삭제 후 페이지 리다이렉트
                    });
                  })
                  .catch((error) => {
                    console.error("Error deleting:", error);
                    Swal.fire({
                      icon: 'error',
                      text: '계정 삭제에 실패하였습니다.',
                      confirmButtonText: '확인'
                    });
                  });
              } else {
                Swal.fire({
                  icon: 'error',
                  text: '비밀번호가 일치하지 않습니다.',
                  confirmButtonText: '확인'
                });
              }
            })
            .catch((error) => {
              console.error("Error verifying password:", error);
              Swal.fire({
                icon: 'error',
                text: '비밀번호 확인에 실패하였습니다.',
                confirmButtonText: '확인'
              });
            });
          }
        });
      }
    });
  };

  // 사용자 역할이 master 또는 admin이 아닌 경우 접근 거부 메시지 렌더링
  if (userRole !== 'master' && userRole !== 'admin') { // 조건 수정
    return (
      <Container fluid className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <Row>
          <Col className="text-center">
            <h3>접근 거부</h3>
            <p>이 페이지는 시스템 관리자만 접근할 수 있습니다.</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <>
      <div className="main-content mt-5">
        <Container fluid className='mb-3 mt-3'>
          <Row>
            <Col className='d-flex justify-content-left titles'>
              회원관리
            </Col>
          </Row>
        </Container>
        <Container fluid>
          <Row>
            <Col>
              <div className="cardm p-3">
                <PaginatedSearch
                  data={members.map((member, cnt) => ({
                    index: cnt + 1,
                    member_id: member.username,
                    member_jic: member.role,
                    member_at: member.created_at.substring(0, 10),
                    member_name: member.mem_name,
                    member_gender: member.gender,
                    member_age: member.age,
                    member_phone: member.phone_number,
                    member_stauts: member.account_status,
                    user_id: member.user_id,
                  }))}

                  columns={[
                    { accessor: 'index', Header: '순서' },
                    { accessor: 'member_id', Header: '회원ID' },
                    { accessor: 'member_jic', Header: '직책',
                      Cell: ({ row }) => (
                        <p>
                          {row.values.member_jic === 'admin' ? '관리자' : row.values.member_jic === 'guard' ? '경비원' : '사용자'}
                        </p>
                      ),
                    },
                    { accessor: 'member_at', Header: '가입날짜' },
                    { accessor: 'member_name', Header: '이름' },
                    !isMobile && { accessor: 'member_gender', Header: '성별',
                      Cell: ({ row }) => (
                        <p>
                          {row.values.member_gender === 'man' ? '남' : '여'}
                        </p>
                      ),
                    },
                    { accessor: 'member_phone', Header: '전화번호' },
                    {
                      accessor: 'member_stauts',
                      Header: '상태',
                      Cell: ({ row }) => (
                        <InputGroup className='justify-content-center'>
                          <Button
                            style={{
                              backgroundColor: row.values.member_stauts === 'active' ? '#BAF2E5' : '#FFC5C5',
                              color: row.values.member_stauts === 'active' ? '#008767' : 'red',
                              border: row.values.member_stauts === 'active' ? '#16C098' : '#FFC5C5',
                            }}
                          >
                            {row.values.member_stauts === 'active' ? '정상' : '정지'}
                          </Button>
                          <FaRegEdit
                            style={{ width: "30px", height: "40px", marginLeft: '10px', color: 'lightgreen' }}
                            onClick={() => editClick(row.original.user_id)} // 수정 버튼 클릭 시 user_id 전달
                          />
                          <MdDeleteForever
                            style={{ width: "30px", height: "40px", marginLeft: '5px', color: 'red' }}
                            onClickCapture={() => deleteMember(row.original.user_id)} // 삭제 버튼 클릭 시 user_id 전달
                          />
                        </InputGroup>
                      ),
                    },
                  ].filter(Boolean)}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <UserModal
        show={showModal}
        handleClose={handleCloseModal}
        selectedMember={selectedMember}
 
      />
    </>
  );
};

export default Member;
