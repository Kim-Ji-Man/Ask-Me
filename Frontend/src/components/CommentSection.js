import React, { useState } from "react";
import "../css/CommentSection.css";



const CommentSection = ({ comments: initialComments }) => {

  // Utility function to format the date
const formatCreatedAt = (isoDateStr) => {
  const parsedDate = new Date(isoDateStr);
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return parsedDate.toLocaleString('ko-KR', options).replace(',', '');
};

  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    const newCommentObj = {
      id: comments.length + 1,
      author: "관리자", // 이곳에 실제 사용자 이름 적용 가능
      date: new Date().toISOString().slice(0, 10),
      text: newComment,
      likes: 0,
      reports: 0,
    };
    setComments([...comments, newCommentObj]);
    
    setNewComment("");
  };

  console.log(comments,"");

  const handleLike = (id) => {
    setComments(comments.map(comment =>
      comment.id === id ? { ...comment, likes: comment.likes + 1 } : comment
    ));
  };

  const handleReport = (id) => {
    setComments(comments.map(comment =>
      comment.id === id ? { ...comment, reports: comment.reports + 1 } : comment
    ));
  };

  return (
    <div className="comment-section">
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <div className="comment-author-date">
            {comment.username} | {formatCreatedAt(comment.created_at)}
          </div>
          <div className="comment-text">{comment.content}</div>
          <div className="comment-actions">
            <button onClick={() => handleLike(comment.id)} className="like-button">
              👍 좋아요 {comment.likes_count}
            </button>
            <button onClick={() => handleReport(comment.id)} className="report-button">
              🚨 신고 {comment.report_count}
            </button>
          </div>
        </div>
      ))}
      <div className="comment-input-section">
        <textarea
          className="comment-input"
          placeholder="댓글을 입력하세요..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button className="comment-submit-button" onClick={handleAddComment}>
          등록
        </button>
      </div>
    </div>
  );
};

export default CommentSection;