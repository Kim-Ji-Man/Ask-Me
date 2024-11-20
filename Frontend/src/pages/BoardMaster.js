import React, { useEffect, useState } from "react";
import { Button, Col, Container, InputGroup, Modal, Row } from "react-bootstrap";
import PaginatedSearch from "../components/PaginatedSearch";
import axios from "../axios";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const BoardMaster = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [board, setBoard] = useState([]);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // 선택된 게시글 또는 댓글 정보
  const [isComment, setIsComment] = useState(false); // 게시글인지 댓글인지 구분하기 위한 상태
  const [reportCounts, setReportCounts] = useState({
    advertisement: 0,
    abuse: 0,
    explicit: 0,
    spam: 0,
    others: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserRole(payload.role);
    }

    axios.get("/community/posts")
      .then((res) => {
        setBoard(res.data);
      })
      .catch((error) => console.error("게시글 가져오기 오류:", error));

    axios.get("/community/posts/comments/all")
      .then((res) => setComments(res.data))
      .catch((error) => console.error("댓글 가져오기 오류:", error));
  }, []);


  if (userRole !== "master") {
    return (
      <Container
        fluid
        className="d-flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <Row>
          <Col className="text-center">
            <h3>접근 거부</h3>
            <p>이 페이지는 시스템 관리자만 접근할 수 있습니다.</p>
          </Col>
        </Row>
      </Container>
    );
  }

  console.log(selectedItem,"나오니??");
  console.log(isComment,"어떻게");

  

  const handlePostClick = (postId) => navigate(`/community/posts/${postId}`);

  const handleDeleteIconClick = (item, isCommentItem) => {
    setSelectedItem(item);
    setIsComment(isCommentItem);

    // 클릭한 게시물의 신고 사유별 카운트 가져오기
    setReportCounts({
      advertisement: item.reason_1_count || 0,
      abuse: item.reason_2_count || 0,
      explicit: item.reason_3_count || 0,
      spam: item.reason_4_count || 0,
      others: item.reason_5_count || 0,
    });

    setShowModal(true);
  };

  const handleDeleteItem = () => {
    const deleteUrl = isComment 
      ? `/community/comments/${selectedItem.comment_id}`
      : `/community/posts/${selectedItem.post_id}`;
    
    axios.delete(deleteUrl)
      .then(() => {
        if (isComment) {
          setComments(comments.filter(c => c.comment_id !== selectedItem.comment_id));
          window.location.href='/BoardMater'
        } else {
          setBoard(board.filter(b => b.post_id !== selectedItem.post_id));
          window.location.href='/BoardMater'
        }
        setShowModal(false);
      })
      .catch((error) => console.error(`${isComment ? "댓글" : "게시글"} 삭제 오류:`, error));
  };

  return (
    <div className="main-content mt-5">
      {/* 게시글 영역 */}
      <Container fluid className="mb-3 mt-3">
        <Row>
          <Col className="d-flex justify-content-left titles">게시글</Col>
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
                  user_id: post.username,
                  created_at: new Date(post.created_at).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  title: post.title,
                  content: post.content,
                  heart: post.likes_count,
                  no: post.report_count,
                  comment_count: post.comment_count,
                  reason_1_count: post.reason_1_count,
                  reason_2_count: post.reason_2_count,
                  reason_3_count: post.reason_3_count,
                  reason_4_count: post.reason_4_count,
                  reason_5_count: post.reason_5_count,
                }))}
                columns={[
                  { accessor: "index", Header: "순서" },
                  {
                    accessor: "title",
                    Header: "제목",
                    width: "40%",
                    Cell: ({ row }) => (
                      <span onClick={() => handlePostClick(row.original.post_id)}>
                        {row.values.title}
                      </span>
                    ),
                  },
                  { accessor: "created_at", Header: "날짜", width: "20%", },
                  { accessor: "user_id", Header: "작성자" },
                  { accessor: "comment_count", Header: "댓글 수" },
                  { accessor: "heart", Header: "좋아요" },
                  { accessor: "no", Header: "신고" },
                  {
                    accessor: "member_status",
                    Header: "상태",
                    Cell: ({ row }) => (
                      <InputGroup className="justify-content-center">
                        <MdDeleteForever
                          onClick={() => handleDeleteIconClick(row.original, false)}
                          style={{
                            width: "30px",
                            height: "40px",
                            marginLeft: "5px",
                            color: "grey",
                          }}
                        />
                      </InputGroup>
                    ),
                  },
                ]}
              />
            </div>
          </Col>
        </Row>
      </Container>

      {/* 댓글 영역 */}
      <Container fluid className="mb-3 mt-5">
        <Row>
          <Col className="d-flex justify-content-left titles">댓글</Col>
        </Row>
      </Container>
      <Container fluid>
        <Row>
          <Col>
            <div className="card p-3">
              <PaginatedSearch
                data={comments.map((comment, cnt) => ({
                  index: cnt + 1,
                  post_id: comment.post_id,
                  comment_id: comment.comment_id,
                  user_id: comment.username,
                  created_at: new Date(comment.created_at).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  content: comment.content,
                  heart: comment.likes_count,
                  no: comment.report_count,
                  Nocontent: comment.reasons,
                  reason_1_count: comment.reason_1_count,
                  reason_2_count: comment.reason_2_count,
                  reason_3_count: comment.reason_3_count,
                  reason_4_count: comment.reason_4_count,
                  reason_5_count: comment.reason_5_count,
                }))}
                columns={[
                  { accessor: "index", Header: "순서" },
                  {
                    accessor: "content",
                    Header: "댓글내용",
                    width: "40%",
                    Cell: ({ row }) => (
                      <span onClick={() => handlePostClick(row.original.post_id)}>
                        {row.values.content}
                      </span>
                    ),
                  },
                  { accessor: "created_at", Header: "날짜" ,width:"20%"},
                  { accessor: "user_id", Header: "작성자" },
                  { accessor: "heart", Header: "좋아요" },
                  { accessor: "no", Header: "신고" },
                  {
                    accessor: "member_status",
                    Header: "상태",
                    Cell: ({ row }) => (
                      <InputGroup className="justify-content-center">
                        <MdDeleteForever
                          onClick={() => handleDeleteIconClick(row.original, true)}
                          style={{
                            width: "30px",
                            height: "40px",
                            marginLeft: "5px",
                            color: "grey",
                          }}
                        />
                      </InputGroup>
                    ),
                  },
                ]}
              />
            </div>
          </Col>
        </Row>
      </Container>

      {/* 신고 모달 */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{background:"#1F316F"}}>
          <Modal.Title style={{color:"white"}}>신고 내역</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container className="report-category-table">
            <Row>
              <Col xs={6}>
                <p><strong>광고/홍보:</strong> {reportCounts.advertisement}회</p>
              </Col>
              <Col xs={6}>
                <p><strong>기타:</strong> {reportCounts.others}회</p>
              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                <p><strong>도배:</strong> {reportCounts.spam}회</p>
              </Col>
              <Col xs={6}>
                <p><strong>욕설/비방:</strong> {reportCounts.abuse}회</p>
              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                <p><strong>음란성:</strong> {reportCounts.explicit}회</p>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDeleteItem}>
            삭제
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default BoardMaster;