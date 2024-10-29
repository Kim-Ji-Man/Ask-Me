import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axios";
import Swal from "sweetalert2";
import "../css/DetailPage.css"; // 스타일 파일
import { Row, Button, Form, Col } from "react-bootstrap";
import CommentSection from "../components/CommentSection";

const DetailPage = () => {
  const { post_id } = useParams();
  const [boardDetail, setBoardDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const navigate = useNavigate();

  // 날짜 포맷 함수
  const formatCreatedAt = (isoDateStr) => {
    const parsedDate = new Date(isoDateStr);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return parsedDate.toLocaleString('ko-KR', options).replace(',', '');
  };

  useEffect(() => {
    // 게시글 데이터 가져오기
    axios.get(`/community/posts/${post_id}`)
      .then(response => {
        setBoardDetail(response.data);
        setPreviewImage(response.data.img);
      })
      .catch(error => {
        Swal.fire("오류", "게시글을 불러오지 못했습니다.", "error");
      });

    // 댓글 데이터 가져오기
    axios.get(`/community/posts/${post_id}/comments`)
      .then(response => {
        setComments(response.data);
      })
      .catch(error => {
        Swal.fire("오류", "댓글을 불러오지 못했습니다.", "error");
      });
  }, [post_id]);

  // 게시물 삭제 함수
  const deletePost = async () => {
    try {
      const result = await Swal.fire({
        icon: "question",
        text: "정말 삭제하시겠습니까?",
        showCancelButton: true,
        confirmButtonText: "확인",
        cancelButtonText: "취소"
      });

      if (result.isConfirmed) {
        await axios.delete(`/community/posts/${post_id}`);
        Swal.fire({
          icon: "success",
          text: "삭제 성공!",
          confirmButtonText: "확인"
        }).then(() => {
          navigate("/BoardMaster");
        });
      }
    } catch (err) {
      console.error('게시글 삭제 오류:', err);
      Swal.fire("오류", "게시글 삭제에 실패했습니다.", "error");
    }
  };

  if (!boardDetail) return <div>게시글을 불러오는 중...</div>;

  return (
    <>
      <Row className="mt-5"></Row>
      <div className="my-5">
        <Row className="mt-5"></Row>
        <div className="detail-container my-5">
          <div className="detail-header">
            <span className="detail-views">조회수: {boardDetail.views}</span>
            <span className="detail-likes ms-3">좋아요: {boardDetail.likes_count}</span>
            <span className="detail-reports ms-3">신고: {boardDetail.report_count}</span>
          </div>

          <Row className="button-group ">
            <Col>
              <Button 
                onClick={deletePost} 
                variant="danger" 
                className="btn"
              >
                삭제
              </Button>
            </Col>
          </Row>

          <div className="detail-content">
            <h3 className="detail-title">{boardDetail.title}</h3>
            <p className="detail-info">작성자: {boardDetail.username} | 날짜: {formatCreatedAt(boardDetail.created_at)}</p>
            <hr />
            <p className="detail-text">{boardDetail.content}</p>
            {boardDetail.img && (
              <img
                src={previewImage}
                alt="Board Detail"
                style={{ maxWidth: "100%" }}
              />
            )}
          </div>
        </div>
        <CommentSection comments={comments} />
      </div>
    </>
  );
};

export default DetailPage;
