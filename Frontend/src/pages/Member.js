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

const Member = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberSeq ,setMemberSeq] = useState(0)
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // JWT에서 사용자 역할 확인
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);
    }

    // 회원 데이터 요청
    axios
      .get("/Member")
      .then((res) => {
        setMembers(res.data);
        console.log(res.data);
      })
      .catch(() => {
        console.log("서버 연결 실패");
      });
  }, [showModal]);

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
  const editClick = (user_id) => {  // 함수 이름 수정
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
            if (inputPassword === "0000") {
              axios.delete(`/Member/Delete/${user_id}`)
                .then(() => {
                  Swal.fire({
                    icon: 'success',
                    text: '계정이 삭제되었습니다.',
                    confirmButtonText: '확인'
                  });
                }).then(() => {
                  window.location.href = '/Member';
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
          }
        });
      }
    });
  };

  // 사용자 역할이 master가 아닌 경우 접근 거부 메시지 렌더링
  if (userRole !== 'master') {
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
                    member_id: member.email,
                    member_jic: member.role,
                    member_at: member.created_at.substring(0, 10),
                    member_name: member.username,
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
                          {row.values.member_jic === 'user' ? '사용자' : '관리자'}
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
                    !isMobile && { accessor: 'member_age', Header: '나이' },
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
                            style={{ width: "30px", height: "40px", marginLeft: '10px' }}
                            onClick={() => editClick(row.original.user_id)} // 수정 버튼 클릭 시 user_id 전달
                          />
                          <MdDeleteForever
                            style={{ width: "30px", height: "40px", marginLeft: '5px' }}
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