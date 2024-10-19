import 'package:flutter/material.dart';

class Login extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back), // 뒤로가기 아이콘
          onPressed: () {
            Navigator.pop(context); // 이전 화면으로 돌아가기
          },
        ),
        backgroundColor: Colors.white, // AppBar 배경색을 하얀색으로 설정
        elevation: 0, // AppBar의 그림자 제거
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start, // 중앙 정렬을 위쪽으로 변경
          children: <Widget>[
            // 아이디 입력 필드 위에 이미지 추가
            Container(
              alignment: Alignment.center, // 중앙 정렬
              child: Image.asset(
                'images/img_logo2.png', // 사용자 아이콘 이미지 경로
                fit: BoxFit.contain, // 이미지 비율 유지 및 잘리지 않게 조정
                width: 170, // 원하는 너비
                height: 170, // 원하는 높이
              ),
            ),
            SizedBox(height: 10), // 높이를 줄여서 이미지 위쪽으로 이동
            // 아이디 입력 칸을 Container로 변경
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8.0),
              ),
              child: TextField(
                decoration: InputDecoration(
                  border: InputBorder.none, // 경계선 제거
                  labelText: '아이디 입력',
                ),
              ),
            ),
            SizedBox(height: 20),
            // 비밀번호 입력 칸을 Container로 변경
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8.0),
              ),
              child: TextField(
                decoration: InputDecoration(
                  border: InputBorder.none, // 경계선 제거
                  labelText: '비밀번호 입력',
                ),
                obscureText: true,
              ),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // 로그인 처리 로직
                print('로그인 버튼이 눌렸습니다.');
              },
              child: Text(
                '로그인',
                style: TextStyle(color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
                backgroundColor: Color(0xFF0F148D), // 동일한 남색
              ),
            ),
            SizedBox(height: 20),
            // 비밀번호 찾기 텍스트 추가
            GestureDetector(
              onTap: () {
                // 비밀번호 찾기 페이지로 이동
                print('비밀번호 찾기 페이지로 이동합니다.');
              },
              child: Text(
                '비밀번호 찾기',
                style: TextStyle(
                  color: Colors.grey[500],
                  fontSize: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}