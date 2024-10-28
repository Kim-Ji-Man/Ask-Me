import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/DetailPage.css"; // CSS 파일에서 스타일을 정의합니다.
import { Row, Button, Form, Col } from "react-bootstrap";
import Swal from 'sweetalert2';
import CommentSection from "../components/CommentSection";

const DetailPage = () => {
  const { board_seq } = useParams(); // 파라미터로부터 board_seq를 가져옵니다.
  const [boardDetail, setBoardDetail] = useState({
    title: "더미 제목",
    content: "더미 내용입니다. 여기에 게시글 내용을 넣습니다.",
    img: "/img/office.jpg", // 더미 이미지 URL
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const navigate = useNavigate();
  const seq = window.sessionStorage.getItem('mem_seq');

  useEffect(() => {
    // 더미 데이터로 초기화
    setEditedTitle(boardDetail.title);
    setEditedContent(boardDetail.content);
    if (boardDetail.img) {
      setPreviewImage(boardDetail.img);
    }
  }, [boardDetail]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // 수정된 내용으로 상태 업데이트
    setBoardDetail({
      ...boardDetail,
      title: editedTitle,
      content: editedContent,
      img: selectedFile ? URL.createObjectURL(selectedFile) : boardDetail.img,
    });
    setIsEditing(false);
    Swal.fire({
      icon: 'success',
      text: '수정 성공!',
      confirmButtonText: '확인'
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    document.getElementById('imageInput').click();
  };

  const handleRemoveImage = () => {
    setPreviewImage("");
    setSelectedFile(null);
  };

  const deletepost = () => {
    Swal.fire({
      icon: 'question',
      text: '정말 삭제하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          text: '삭제 성공!',
          confirmButtonText: '확인'
        }).then(() => {
          navigate('/Board');
        });
      }
    });
  };

  return (
    <>
      <Row className="mt-5"></Row>
      <div className="my-5">
        <Row className="mt-5"></Row>
        <div className="detail-container my-5">
          {seq === '0' && !isEditing && (
            <Row className="button-group">
              <Col>
                <Button onClick={handleEdit} variant='warning' className="btn me-2">
                  수정
                </Button>
                <Button 
                  onClick={deletepost} 
                  variant='danger' 
                  className="btn"
                >
                  삭제
                </Button>
              </Col>
            </Row>
          )}
          {isEditing ? (
            <div className="detail-content">
              <Form.Group controlId="formTitle" className="title">
                <Form.Label>제목</Form.Label>
                <Form.Control
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                />
              </Form.Group>
              <Form.Group controlId="formContent" className="content">
                <Form.Label>내용</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={10}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                />
              </Form.Group>
              <Form.Group controlId="formFile" className="file">
                <Form.Label>이미지 파일</Form.Label>
                <Button
                  variant="primary" 
                  onClick={triggerFileInput}
                  className="custom-select-button"
                >
                  이미지 선택
                </Button>
                <input
                  id="imageInput"
                  type="file"
                  className="hidden-file-input"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                {previewImage && (
                  <div className="image-preview">
                    <img src={previewImage} alt="미리보기" style={{ maxWidth: '100%', marginTop: '10px' }} />
                    <Button variant="danger" onClick={handleRemoveImage} style={{ marginTop: '10px' }}>
                      이미지 제거
                    </Button>
                  </div>
                )}
              </Form.Group>
              <Button onClick={handleSave} variant="success" className="mt-3">
                저장
              </Button>
            </div>
          ) : (
            <div className="detail-content">
              <h3 className="detail-title">{boardDetail.title}</h3>
              <p className="detail-info">작성자: 관리자 | 날짜: 2024-07-29</p>
              <hr />
              <p className="detail-text">
                {boardDetail.content}
              </p>
              {boardDetail.img && (
                <img
                  src={previewImage}
                  alt="Board Detail"
                  style={{ maxWidth: '100%' }}
                />
              )}
            </div>
          )}
        </div>
        <CommentSection/>
      </div>
    </>
  );
};

export default DetailPage;
