import 'package:flutter/material.dart';

class SignUp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // 배경색을 흰색으로 변경
      appBar: AppBar(
        backgroundColor: Colors.transparent, // AppBar 배경 투명
        elevation: 0, // 그림자 제거
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.black), // 뒤로가기 버튼
          onPressed: () {
            Navigator.pop(context); // 이전 화면으로 이동
          },
        ),
      ),
      body: SingleChildScrollView( // 스크롤 가능하도록 감싸기
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            // 고정된 로고 이미지
            Container(
              alignment: Alignment.center, // 중앙 정렬
              width: 170, // 원하는 너비
              height: 170, // 원하는 높이
              child: Image.asset(
                'images/img_logo2.png', // 여기에 로고 이미지 경로 입력
                fit: BoxFit.contain, // 이미지 비율 유지 및 잘리지 않게 조정
              ),
            ),
            SizedBox(height: 20),
            // 닉네임 입력을 위한 Container
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.grey[200], // 텍스트 입력 영역 배경색
                borderRadius: BorderRadius.circular(8),
              ),
              child: TextField(
                decoration: InputDecoration(
                  border: InputBorder.none,
                  hintText: '닉네임', // 닉네임 힌트 텍스트
                ),
              ),
            ),
            SizedBox(height: 20),
            // 아이디 입력을 위한 Container
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.grey[200], // 텍스트 입력 영역 배경색
                borderRadius: BorderRadius.circular(8),
              ),
              child: TextField(
                decoration: InputDecoration(
                  border: InputBorder.none,
                  hintText: '아이디',
                ),
              ),
            ),
            SizedBox(height: 20),
            // 비밀번호 입력을 위한 Container
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.grey[200], // 텍스트 입력 영역 배경색
                borderRadius: BorderRadius.circular(8),
              ),
              child: TextField(
                obscureText: true, // 비밀번호를 ***로 처리
                decoration: InputDecoration(
                  border: InputBorder.none,
                  hintText: '비밀번호',
                ),
              ),
            ),
            SizedBox(height: 20),
            // 비밀번호 재확인 입력을 위한 Container
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.grey[200], // 텍스트 입력 영역 배경색
                borderRadius: BorderRadius.circular(8),
              ),
              child: TextField(
                obscureText: true, // 비밀번호를 ***로 처리
                decoration: InputDecoration(
                  border: InputBorder.none,
                  hintText: '비밀번호 재확인',
                ),
              ),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // 회원가입 처리 로직 추가
                print('회원가입 완료');
              },
              child: Text('회원가입'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
                backgroundColor: Color(0xFF0F148D),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}