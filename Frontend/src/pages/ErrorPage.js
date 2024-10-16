import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import PaginatedSearch from '../components/PaginatedSearch';

const ErrorPage = () => {
    const [userRole, setUserRole] = useState(null);

    const datass = [
        {
            board_seq: 1,
            board_at: '2024-10-01 15:30:00',
            board_title: '서버 연결 오류',
            board_views: 101,
            error_stauts: "해결"
        },
        {
            board_seq: 2,
            board_at: '2024-10-02 11:45:00',
            board_title: '로그인 실패 문제',
            board_views: 150,
            error_stauts: "오류"
        },
        {
            board_seq: 3,
            board_at: '2024-10-02 13:20:00',
            board_title: '데이터베이스 연결 오류',
            board_views: 80,
            error_stauts: "해결"
        },
        {
            board_seq: 4,
            board_at: '2024-10-02 14:50:00',
            board_title: '페이지 로딩 지연',
            board_views: 65,
            error_stauts: "해결"
        },
        {
            board_seq: 5,
            board_at: '2024-10-02 14:50:00',
            board_title: '페이지 로딩 지연',
            board_views: 65,
            error_stauts: "오류"
        }
    ];

    useEffect(() => {
        // JWT에서 사용자 역할 확인
        const token = localStorage.getItem('token');
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
                                data={datass.map((board, cnt) => ({
                                    index: cnt + 1,
                                    board_seq: board.board_seq,
                                    time: board.board_at.substring(0, 16),
                                    board_title: board.board_title,
                                    idcode: board.board_views,
                                    error_stauts: board.error_stauts,
                                }))}
                                columns={[
                                    { accessor: "index", Header: "순서" },
                                    {
                                        accessor: "board_title",
                                        Header: "오류명",
                                        width: "50%",
                                    },
                                    { accessor: "idcode", Header: "오류코드" },
                                    { accessor: "time", Header: "날짜" },
                                    {
                                        accessor: 'error_stauts',
                                        Header: '상태',
                                        Cell: ({ row }) => (
                                            <Button
                                                style={{
                                                    backgroundColor: row.values.error_stauts === "해결" ? '#BAF2E5' : '#FFC5C5',
                                                    color: row.values.error_stauts === "해결" ? '#008767' : 'red',
                                                    border: row.values.error_stauts === "해결" ? '#16C098' : '#FFC5C5',
                                                }}
                                            >
                                                {row.values.error_stauts}
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
}

export default ErrorPage;