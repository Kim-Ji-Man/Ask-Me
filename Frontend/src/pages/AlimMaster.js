import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import axios from '../axios'; // Axios 설정이 되어 있는 모듈
import PaginatedSearch from '../components/PaginatedSearch';

const AlimMaster = () => {
  const [userRole, setUserRole] = useState(null);
  const [alertsData, setAlertsData] = useState([]);

  useEffect(() => {
    // JWT에서 사용자 역할 확인 (관리자 여부)
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);
    }

    // 백엔드에서 알림 데이터를 가져옴
    axios.get('/Alim/MasterAlims')
      .then(response => {
        setAlertsData(response.data);
      })
      .catch(error => {
        console.error('알림 데이터를 불러오는 중 오류 발생:', error);
      });
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
          <Col className='d-flex justify-content-left titles'>알림내역</Col>
        </Row>
      </Container>

      <Container fluid>
        <Row>
          <Col>
            <div className="card p-3">
              {/* PaginatedSearch 컴포넌트에 데이터 전달 */}
              <PaginatedSearch
                data={alertsData.map((alert, cnt) => ({
                  index: cnt + 1,
                  post_id: alert.master_alert_id,
                  reported_name: alert.status === '가입' ? '' : alert.reported_user_name,
                  user_name: alert.status === '가입' ? alert.user_name : alert.alert_user_name,
                  created_at: new Date(alert.created_at).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  title: alert.status === '가입' ? alert.master_alert_content : alert.post_title,
                  status: alert.status,
                }))}
                columns={[
                  { accessor: "index", Header: "순서" },
                  { accessor: "title", Header: "알림내용", width: "30%" },
                  { accessor: "created_at", Header: "날짜" },
                  { accessor: "user_name", Header: "아이디" },
                  {
                    accessor: "status",
                    Header: "상태",
                    Cell: ({ row }) => (
                      <Button
                        style={{
                          backgroundColor: row.values.status === '가입' ? '#BAF2E5' : '#FFC5C5',
                          color: row.values.status === '가입' ? '#008767' : 'red',
                          borderColor: row.values.status === '가입' ? '#16C098' : '#FFC5C5',
                        }}
                      >
                        {row.values.status === '가입' ? '가입' : '신고'}
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