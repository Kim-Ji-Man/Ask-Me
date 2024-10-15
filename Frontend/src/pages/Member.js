import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import PaginatedSearch from '../components/PaginatedSearch'
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import InputGroup from 'react-bootstrap/InputGroup';
import Swal from "sweetalert2";
import "../css/Member.css"
import UserModal from '../components/UserModal';

const Member = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null); // 선택된 멤버 상태 추가

  const [members, setMembers] = useState([
    {
        member_seq: 1,
        member_id :'sdfa123456',
        member_jic: '관리자',
        member_at: '2024-10-01 15:30:00',
        member_name: "관리자이름",
        member_gender:"여",
        member_age:45,
        member_phone :"010-0000-1234",
        member_stauts:'정상'
      },

      {
          member_seq: 2,
          member_id :'gdsgs13546',
          member_jic: '경비원',
          member_at: '2024-10-02 15:30:00',
          member_name: "경비원이름",
          member_gender:"남",
          member_age:54,
          member_phone :"010-0000-1234",
          member_stauts:'정지'
        },
        
      {
          member_seq: 3,
          member_id :'gdsgs13546',
          member_jic: '경비원',
          member_at: '2024-10-02 15:30:00',
          member_name: "경비원이름",
          member_gender:"남",
          member_age:54,
          member_phone :"010-0000-1234",
          member_stauts:'정지'
        },
        
      {
          member_seq: 4,
          member_id :'gdsgs13546',
          member_jic: '경비원',
          member_at: '2024-10-02 15:30:00',
          member_name: "경비원이름",
          member_gender:"남",
          member_age:54,
          member_phone :"010-0000-1234",
          member_stauts:'정상'
        },
        
      {
          member_seq: 5,
          member_id :'gdsgs13546',
          member_jic: '경비원',
          member_at: '2024-10-02 15:30:00',
          member_name: "경비원이름",
          member_gender:"남",
          member_age:54,
          member_phone :"010-0000-1234",
          member_stauts:'정지'
        },
        
      {
          member_seq: 6,
          member_id :'gdsgs13546',
          member_jic: '경비원',
          member_at: '2024-10-02 15:30:00',
          member_name: "경비원이름",
          member_gender:"남",
          member_age:54,
          member_phone :"010-0000-1234",
          member_stauts:'정상'
        },
        
      {
          member_seq: 7,
          member_id :'gdsgs13546',
          member_jic: '경비원',
          member_at: '2024-10-02 15:30:00',
          member_name: "경비원이름",
          member_gender:"남",
          member_age:54,
          member_phone :"010-0000-1234",
          member_stauts:'정지'
        },
        
      {
          member_seq: 8,
          member_id :'gdsgs13546',
          member_jic: '경비원',
          member_at: '2024-10-02 15:30:00',
          member_name: "경비원이름",
          member_gender:"남",
          member_age:54,
          member_phone :"010-0000-1234",
          member_stauts:'정지'
        },
]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // 모바일 여부 판단
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMember(null); // 모달 닫을 때 선택된 멤버 초기화
  };

  const editeClick = (member_seq) => {
    const member = members.find((m) => m.member_seq === member_seq);
    setSelectedMember(member); // 선택된 멤버 설정
    setShowModal(true); // 모달 열기
  };

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
                    member_id: member.member_id,
                    member_jic: member.member_jic,
                    member_at: member.member_at.substring(0, 10),
                    member_name: member.member_name,
                    member_gender: member.member_gender,
                    member_age: member.member_age,
                    member_phone: member.member_phone,
                    member_stauts: member.member_stauts,
                  }))}
                  columns={[
                    { accessor: 'index', Header: '순서' },
                    { accessor: 'member_id', Header: '회원ID' },
                    { accessor: 'member_jic', Header: '직책' },
                    { accessor: 'member_at', Header: '가입날짜' },
                    { accessor: 'member_name', Header: '이름' },
                    !isMobile && { accessor: 'member_gender', Header: '성별' },
                    !isMobile && { accessor: 'member_age', Header: '나이' },
                    { accessor: 'member_phone', Header: '전화번호' },
                    {
                      accessor: 'member_stauts',
                      Header: '상태',
                      Cell: ({ row }) => (
                        <InputGroup className='justify-content-center'>
                          <Button
                            style={{
                              backgroundColor: row.values.member_stauts === '정상' ? '#BAF2E5' : '#FFC5C5',
                              color: row.values.member_stauts === '정상' ? '#008767' : 'red',
                              border: row.values.member_stauts === '정상' ? '#16C098' : '#FFC5C5',
                            }}
                          >
                            {row.values.member_stauts}
                          </Button>
                          <FaRegEdit
                            style={{ width: "30px", height: "40px", marginLeft: '10px' }}
                            onClick={() => editeClick(row.original.index)}
                          />
                          <MdDeleteForever
                            style={{ width: "30px", height: "40px", marginLeft: '5px' }}
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
        selectedMember={selectedMember} // 선택된 멤버 전달
      />
    </>
  );
};

export default Member;
