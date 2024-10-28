import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Modal, Form, InputGroup } from 'react-bootstrap';
import axios from '../axios';
import "../css/Alim.css";
import { BsDownload, BsThreeDots } from 'react-icons/bs';
import PaginatedSearch from '../components/PaginatedSearch';
import { FaRegEdit } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';

const AlimMaster = () => {
  const [userRole, setUserRole] = useState(null);
  const [board,setBoard] = useState([
    {
      "post_id": 1,
      "user_id": "아이디1",
      "title": "일단 알림상태는 정상,오류,신고 3개로 생각합니다.",
      "content": "이것은 첫 번째 게시글의 내용입니다.",
      "image": "image1.jpg",
      "created_at": "2024-10-24 14:32",
      "heart" : 5,
      "no" : 3,
      "commnet" :5
    },
    {
      "post_id": 2,
      "user_id": "아이디2",
      "title": "두 번째 게시글",
      "content": "두 번째 게시글의 내용입니다. 많은 사람들이 읽어주셨으면 좋겠어요.",
      "image": "image2.jpg",
      "created_at": "2024-10-24 15:05",
      "heart" : 2,
      "no" : 3,  
      "commnet" :8
    },
    {
      "post_id": 3,
      "user_id": "아이디3",
      "title": "세 번째 게시글",
      "content": "세 번째 게시글의 내용입니다. 흥미로운 주제에 대해 이야기해봅시다.",
      "image": "image3.jpg",
      "created_at": "2024-10-23 09:45",
      "heart" : 5,
      "no" : 4,  
      "commnet" :6
    },
    {
      "post_id": 4,
      "user_id": "아이디4",
      "title": "네 번째 게시글",
      "content": "여기 네 번째 게시글의 내용이 있습니다. 여러분의 의견을 듣고 싶어요.",
      "image": "image4.jpg",
      "created_at": "2024-10-22 11:20",
      "heart" : 5,
      "no" : 8,
      "commnet" :0
    },
    {
      "post_id": 5,
      "user_id": "아이디5",
      "title": "다섯 번째 게시글",
      "content": "다섯 번째 게시글의 내용입니다. 많은 분들이 이 내용을 즐기시길 바랍니다.",
      "image": "image5.jpg",
      "created_at": "2024-10-21 08:00",
      "heart" : 8,
      "no" : 3,
      "commnet" :3
    }
  ])
  
  
  useEffect(() => {
    // JWT에서 사용자 역할 확인
    const token = localStorage.getItem('jwtToken');
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
    }
}, []);

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
    <div className="main-content mt-5">
 <Container fluid className='mb-3 mt-3'>
    <Row>
        <Col className='d-flex justify-content-left titles'> 
           알림내역
        </Col>
    </Row>
</Container>
<Container fluid>
    <Row>
        <Col>
        <div className="card p-3">
            <PaginatedSearch
             data={board.map((post, cnt) => ({
                    index: cnt + 1,
                    post_id: post.post_id,
                    user_id : post.user_id,
                    // id: '관리자',
                    created_at: new Date(post.created_at).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                    title: post.title,
                    content: post.content,
                    image: post.image,
                    heart :post.heart,
                    no : post.no,
                    commnet:post.commnet
                }))}
                columns={[
                    { accessor: "index", Header: "순서" },
                    {
                      accessor: "title",
                        Header: "알림내용",
                        width: "30%",
                    },
                    // { accessor: "id", Header: "직책" }, // 포매팅된 날짜 표시
                    { accessor: "created_at", Header: "날짜" },
                    {
                        accessor: 'user_id',
                        Header: '웹/앱',
                      },
                      {
                        accessor: 'member_stauts',
                        Header: '상태',
                        Cell: ({ row }) => (
                          <Button
                          style={{
                            backgroundColor: row.values.member_stauts === 'active' ? '#BAF2E5' : '#FFC5C5',
                            color: row.values.member_stauts === 'active' ? '#008767' : 'red',
                            border: row.values.member_stauts === 'active' ? '#16C098' : '#FFC5C5',
                          }}
                        >
                          {row.values.member_stauts === 'active' ? '정상' : '신고'}
                        </Button>
                        ),
                      },
                ]}
            />
            </div>
        </Col>
    </Row>
</Container>
    </div>
  );
};

export default AlimMaster;