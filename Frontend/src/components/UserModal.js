import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from"../axios"

const UserModal = ({ show, handleClose, selectedMember }) => {
  const [memberId, setMemberId] = useState("");
  const [memberJic, setMemberJic] = useState("");
  const [memberAt, setMemberAt] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberGender, setMemberGender] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberStatus, setMemberStatus] = useState("");
  const [memberBusinessnumber, setMemberBusinessnumber] = useState("");
  const [memberBusinessadress, setMemberBusinessadress] = useState("");
  const [memberSeq ,setMemberSeq] = useState(0)

  console.log(selectedMember, "sdfdsfsdfsdf");

  useEffect(() => {
    if (selectedMember) {
      setMemberId(selectedMember.username);
      setMemberJic(selectedMember.role === "guard" ? "guard" : "user");
      setMemberAt(selectedMember.created_at.substring(0, 10));
      setMemberName(selectedMember.mem_name);
      setMemberGender(selectedMember.gender);
      setMemberPhone(selectedMember.phone_number);
      setMemberStatus(selectedMember.account_status);
      setMemberBusinessnumber(selectedMember.business_number === null ? " " : selectedMember.business_number);
      setMemberBusinessadress("광주 동구 충장로");
      setMemberSeq(selectedMember.user_id)
      console.log(selectedMember.gender, "머로 나오니?");
      console.log(selectedMember.user_id, "제대로??");

    }
  }, [selectedMember]);

  function handelSave() {
    handleClose(null);

    Swal.fire({
      title: "관리자비밀번호를 입력하세요",
      input: "password",
      inputAttributes: {
        autocapitalize: "off",
        required: "required",
        minLength: 4,
      },
      inputPlaceholder: "관리자 비밀번호 입력",
      showCancelButton: true,
      confirmButtonText: "확인",
      cancelButtonText: "취소",
    }).then((passwordResult) => {
      if (passwordResult.isConfirmed) {
        const inputPassword = passwordResult.value;
        
        if (inputPassword === "0000") {
          console.log(memberName, "바뀔까?");
          
          const updatedInfo = {
            username: memberId,
            role: memberJic,
            mem_name :memberName,
            gender:memberGender,
            phone_number: memberPhone,
            account_status:memberStatus,
          };


          axios.post(`/Member/UpdateMember/${memberSeq}`, updatedInfo)
          .then(() => {
            Swal.fire({
              icon: 'success',
              text: '정보변경이 완료되었습니다.',
              confirmButtonText: '확인'
            });
          }).then(() => {
            window.location.href = '/Member';
          })
          .catch((error) => {
            console.error("Error updating:", error);
            Swal.fire({
              icon: 'error',
              text: '정보변경 실패하였습니다.',
              confirmButtonText: '확인'
            });
          });
        } else {
          Swal.fire({
            icon: "error",
            text: "비밀번호가 일치하지 않습니다.",
            confirmButtonText: "확인",
          });
        }
      }
    });
  }

  return (
    <Modal show={show} onHide={() => handleClose(null)}>
      <Modal.Header
        closeButton
        style={{ backgroundColor: "black", color: "white" }}
      >
        <Modal.Title>회원수정</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="my-3">
            <Form.Label>회원ID</Form.Label>
            <Form.Control
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="my-3">
            <Form.Label>직책</Form.Label>
            <Form.Control
              as="select"
              value={memberJic}
              onChange={(e) => setMemberJic(e.target.value)}
            >
              <option value="guard">경비원</option>
              <option value="user">사용자</option>
              
            </Form.Control>
          </Form.Group>

          <Form.Group className="my-3">
            <Form.Label>가입날짜</Form.Label>
            <Form.Control
              type="text"
              value={memberAt}
              onChange={(e) => setMemberAt(e.target.value)}
              disabled
            />
          </Form.Group>

          <Form.Group className="my-3">
            <Form.Label>이름</Form.Label>
            <Form.Control
              type="text"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="my-3">
            <Form.Label>성별</Form.Label>
            <Form.Control
              as="select"
              value={memberGender}
              onChange={(e) => setMemberGender(e.target.value)}
            >
              <option value="man">남</option>
              <option value="woman">여</option>
            </Form.Control>
          </Form.Group>

          <Form.Group className="my-3">
            <Form.Label>전화번호</Form.Label>
            <Form.Control
              type="text"
              value={memberPhone}
              onChange={(e) => setMemberPhone(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="my-3">
            <Form.Label>상태</Form.Label>
            <Form.Control
              as="select"
              value={memberStatus}
              onChange={(e) => setMemberStatus(e.target.value)}
            >
              <option value="active">정상</option>
              <option value="inactive">정지</option>
            </Form.Control>
          </Form.Group>
          <Form.Group className="my-3">
            <Form.Label>사업자번호</Form.Label>
            <Form.Control
              type="text"
              value={memberBusinessnumber}
              onChange={(e) => setMemberBusinessnumber(e.target.value)}
              disabled = {memberBusinessnumber == " "}
            />
          </Form.Group>
          <Form.Group className="my-3">
            <Form.Label>주소</Form.Label>
            <Form.Control
              type="text"
              value={memberBusinessadress}
              onChange={(e) => setMemberBusinessadress(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleClose(null)}>
          닫기
        </Button>
        <Button variant="primary" onClick={handelSave}>
          저장
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserModal;