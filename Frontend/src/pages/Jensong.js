import React from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import PaginatedSearch from '../components/PaginatedSearch';

const Jensong = () => {

  const datass = [
    {
      jeon_seq: 1,
      jeon_at: '2024-10-01 18:30:00',
      jeon_title: '흉기관측',
      jeon_stauts: '완료',
    },
    {
      jeon_seq: 2,
      jeon_at: '2024-10-01 18:30:00',
      jeon_title: '흉기관측',
      jeon_stauts: '완료',
    },
    {
      jeon_seq: 3,
      jeon_at: '2024-10-01 18:30:00',
      jeon_title: '흉기관측',
      jeon_stauts: '실패',
    },
    {
      jeon_seq: 4,
      jeon_at: '2024-10-01 18:30:00',
      jeon_title: '흉기관측',
      jeon_stauts: '실패',
    },
    {
      jeon_seq: 5,
      jeon_at: '2024-10-01 18:30:00',
      jeon_title: '흉기관측',
      jeon_stauts: '정상',
    },
   
  ];



  return (
    <div className="main-content mt-5">
      <Container fluid>
      <Row className='mt-3 mb-3'>
            <Col className='d-flex justify-content-left titles' >
                전송내역
            </Col>
        </Row>
      </Container>
      <Container fluid>
        <Row>
          <Col>
          <div className="card p-3">
            <PaginatedSearch
              data={datass.map((jeon, cnt) => ({
                index: cnt + 1,
                jeon_seq: jeon.jeon_seq,
                jeon_at: jeon.jeon_at.substring(0, 16),
                jeon_title: jeon.jeon_title,
                jeon_stauts: jeon.jeon_stauts,
              }))}
              columns={[
                { accessor: 'index', Header: '순서' },
                { accessor: 'jeon_title', Header: '알림명' },
                { accessor: 'jeon_at', Header: '날짜' },
                {
                  accessor: 'jeon_stauts',
                  Header: '상태',
                  Cell: ({ row }) => (
                    <Button
                      style={{
                        backgroundColor:
                          row.values.jeon_stauts === '완료'
                            ? '#BAF2E5'
                            : '#FFC5C5',
                        color:
                          row.values.jeon_stauts === '완료'
                            ? '#008767'
                            : 'red',
                        border:
                          row.values.jeon_stauts === '완료'
                            ? '#16C098'
                            : '#FFC5C5',
                      }}
                    >
                      {row.values.jeon_stauts}
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

export default Jensong