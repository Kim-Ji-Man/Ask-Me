// CommentSection.js
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import "../css/CommentSection.css"; // 스타일 정의

const CommentSection = () => {
  const [comments, setComments] = useState([
    {
      id: 1,
      username: "user1",
      content: "이 게시글 너무 좋아요!",
      date: "2024-07-30",
      likes: 3,
      reports: 0,
    },
    {
      id: 2,
      username: "user2",
      content: "유익한 정보 감사합니다.",
      date: "2024-07-29",
      likes: 5,
      reports: 1,
    },
  ]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newId = comments.length + 1;
      setComments([
        ...comments,
        { id: newId, username: "guest", content: newComment, date: "2024-07-31", likes: 0, reports: 0 },
      ]);
      setNewComment("");
    }
  };

  return (
    <div className="comment-section">
      <h5 className="comment-title">댓글</h5>
      <Form.Group controlId="commentForm">
        <Form.Control
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요"
        />
        <Button variant="primary" onClick={handleAddComment} className="mt-2">
          댓글 등록
        </Button>
      </Form.Group>
      {comments.map((comment) => (
        <div key={comment.id} className="comment-item">
          <p className="comment-username">{comment.username}</p>
          <p className="comment-content">{comment.content}</p>
          <p className="comment-date">{comment.date}</p>
          <div className="comment-actions">
            <Button variant="outline-primary" size="sm" className="me-2">
              좋아요 {comment.likes}
            </Button>
            <Button variant="outline-danger" size="sm">
              신고
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentSection;
