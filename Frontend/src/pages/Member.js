import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import PaginatedSearch from '../components/PaginatedSearch'
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import InputGroup from 'react-bootstrap/InputGroup';
import Swal from "sweetalert2";
import "../css/Member.css"



const Member = () => {


const [isMobile, setIsMobile] = useState(false);
const [members,setMembers] = useState([
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
])
      
      useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth <= 768); // Assume 768px as mobile breakpoint
        };
    
        window.addEventListener('resize', handleResize);
        handleResize();
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

      const handleButtonClick = (member_seq) => {


        Swal.fire({
            title: '상태를 변경하시겟습니까?',
            text: '신중하세요.',
            icon: 'warning',
            showCancelButton: true, // cancel버튼 보이기. 기본은 원래 없음
            confirmButtonColor: '#3085d6', // confrim 버튼 색깔 지정
            cancelButtonColor: '#d33', // cancel 버튼 색깔 지정
            confirmButtonText: '승인', // confirm 버튼 텍스트 지정
            cancelButtonText: '취소', // cancel 버튼 텍스트 지정
          }).then(result => {
            // 만약 Promise리턴을 받으면,
            if (result.isConfirmed) { // 만약 모달창에서 confirm 버튼을 눌렀다면
                    // 클릭된 멤버의 상태를 변경
        setMembers((prevMembers) =>
            prevMembers.map((member) =>
              member.member_seq === member_seq
                ? {
                    ...member,
                    member_stauts: member.member_stauts === '정상' ? '정지' : '정상',
                  }
                : member
            )
          );
               Swal.fire('승인이 완료되었습니다.', '화끈하시네요~!', 'success');
            }
         });
      };

      function deleteClick(){
        Swal.fire({
            title: '삭제하시겠습니까?',
            text: '다시 되돌릴 수 없습니다. 신중하세요.',
            icon: 'warning',
            showCancelButton: true, // cancel버튼 보이기. 기본은 원래 없음
            confirmButtonColor: '#3085d6', // confrim 버튼 색깔 지정
            cancelButtonColor: '#d33', // cancel 버튼 색깔 지정
            confirmButtonText: '승인', // confirm 버튼 텍스트 지정
            cancelButtonText: '취소', // cancel 버튼 텍스트 지정
          }).then(result => {
            // 만약 Promise리턴을 받으면,
            if (result.isConfirmed) { // 만약 모달창에서 confirm 버튼을 눌렀다면
               Swal.fire('삭제가 완료되었습니다.', '화끈하시네요~!', 'success');
            }
         });
      }

      function editeClick(){
        Swal.fire({
            title: '수정하시겠습니까?',
            text: '신중하세요.',
            icon: 'warning',
            showCancelButton: true, // cancel버튼 보이기. 기본은 원래 없음
            confirmButtonColor: '#3085d6', // confrim 버튼 색깔 지정
            cancelButtonColor: '#d33', // cancel 버튼 색깔 지정
            confirmButtonText: '승인', // confirm 버튼 텍스트 지정
            cancelButtonText: '취소', // cancel 버튼 텍스트 지정
          });
      }


  return (
   
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
                // 모바일 화면에서는 성별, 나이 컬럼을 숨김
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
                        onClick={() => handleButtonClick(row.original.index)}
                      >
                        {row.values.member_stauts}
                      </Button>
           
                        <FaRegEdit style={{width:"30px",height:"40px",marginLeft:'10px'}} 
                            onClick={()=>editeClick(row.original.index)}
                        />
               
                        <MdDeleteForever style={{width:"30px",height:"40px",marginLeft:'5px'}}  
                            onClick={()=>deleteClick(row.original.index)}
                        />
                        </InputGroup>
                    ),
                  },
              ].filter(Boolean)} // 필터로 `false` 값을 제거
            />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Member