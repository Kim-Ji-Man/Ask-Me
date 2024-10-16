import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import PaginatedSearch from '../components/PaginatedSearch'
import axios from '../axios'

const ErrorPage = () => {


  const [errors, setErrors] = useState([]);
  useEffect(() => {
    axios
      .get("/Error") // 데이터 요청
      .then((res) => {
        setErrors(res.data)
        console.log(res.data);
      })
      .catch(() => {
        console.log("서버 연결 실패");
      });
  }, []);

    const datass = [
        {
          board_seq: 1,
          board_at: '2024-10-01 15:30:00',
          board_title: '서버 연결 오류',
          board_views: 101,
          error_stauts:"해결"
        },
        {
          board_seq: 2,
          board_at: '2024-10-02 11:45:00',
          board_title: '로그인 실패 문제',
          board_views: 150,
          error_stauts:"오류"
        },
        {
          board_seq: 3,
          board_at: '2024-10-02 13:20:00',
          board_title: '데이터베이스 연결 오류',
          board_views: 80,
          error_stauts:"해결"
        },
        {
          board_seq: 4,
          board_at: '2024-10-02 14:50:00',
          board_title: '페이지 로딩 지연',
          board_views: 65,
          error_stauts:"해결"
        },
        {
            board_seq: 5,
            board_at: '2024-10-02 14:50:00',
            board_title: '페이지 로딩 지연',
            board_views: 65,
            error_stauts:"오류"
          }
      ];

  return (
   <div className="main-content mt-5">
    <Container fluid className='mb-3 mt-3'>
        <Row>
            <Col className='d-flex justify-content-left titles'> 
               이상내역
            </Col>
        </Row>
    </Container>
    <Container fluid>
        <Row>
            <Col>
            <div className="card p-3">
                <PaginatedSearch
                     data={errors.map((error, cnt) => ({
                        index: cnt + 1,
                        error_seq: error.error_id,
                        // id: '관리자',
                        error_date: new Date(error.occurred_at).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                        error_name: error.error_name,
                        error_code: error.error_code,
                        error_stauts: error.resolved_status,
                    }))}
                    columns={[
                        { accessor: "index", Header: "순서" },
                        {
                            accessor: "error_name",
                            Header: "오류명",
                            width: "50%",
                            // Cell: ({ row }) => (
                            //     <span
                            //         onClick={() => handlePostClick(row.original.board_seq)}
                            //     >
                            //         {row.values.board_title}
                            //     </span>
                            // )
                        },
                        { accessor: "error_code", Header: "오류코드" },
                        // { accessor: "id", Header: "직책" }, // 포매팅된 날짜 표시
                        { accessor: "error_date", Header: "날짜" },
                        {
                            accessor: 'error_stauts',
                            Header: '상태',
                            Cell: ({ row }) => (
                              <Button
                                style={{
                                  backgroundColor: row.values.error_stauts === "resolved" ? '#BAF2E5' : '#FFC5C5',
                                  color: row.values.error_stauts === "resolved" ? '#008767' : 'red',
                                  border: row.values.error_stauts === "resolved" ? '#16C098' : '#FFC5C5',
                                }}
                            
                              >
                                {row.values.error_stauts ==="resolved" ? '해결' :'오류'}
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
  )
}

export default ErrorPage