import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import PaginatedSearch from '../components/PaginatedSearch'
import axios from '../axios'


const ErrorPage = () => {

  const [userRole, setUserRole] = useState(null);
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

export default ErrorPage;