import 'package:flutter/material.dart';
import 'guard_signup.dart'; // 경비원 회원가입 페이지 추가

class SignUp extends StatefulWidget {
  @override
  _SignUpState createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> {
  @override
  Widget build(BuildContext context) {
    // 화면 크기 가져오기
    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.pop(context); // 이전 화면으로 돌아가기
          },
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              '사용자 가입 유형을 선택하세요',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 20),
            // 사용자 유형 선택 버튼
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  GestureDetector(
                    onTap: () {
                      // 경비원 버튼 클릭 시 guard_signup.dart로 이동
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => GuardSignUp()),
                      );
                    },
                    child: Container(
                      padding: EdgeInsets.all(20),
                      width: screenWidth * 0.7,  // 화면 너비의 70% 차지
                      height: screenHeight * 0.3, // 화면 높이의 30% 차지
                      decoration: BoxDecoration(
                        color: Color(0xFF0F148D), // 색상 변경
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black26,
                            offset: Offset(0, 4),
                            blurRadius: 6,
                          ),
                        ],
                      ),
                      child: Column(  // Row에서 Column으로 변경하여 아이콘을 텍스트 위에 배치
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.security,
                            color: Colors.white,
                            size: 60, // 아이콘 크기 증가
                          ),
                          SizedBox(height: 10), // 아이콘과 텍스트 사이의 간격
                          Text(
                            '경비원',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 24, // 폰트 크기
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: 20), // 버튼 사이의 간격
                  GestureDetector(
                    onTap: () {
                      // 일반 사용자 버튼 클릭 시 이동할 페이지 설정
                    },
                    child: Container(
                      padding: EdgeInsets.all(20),
                      width: screenWidth * 0.7,  // 화면 너비의 70% 차지
                      height: screenHeight * 0.3, // 화면 높이의 30% 차지
                      decoration: BoxDecoration(
                        color: Color(0xFF0F148D), // 색상 변경
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black26,
                            offset: Offset(0, 4),
                            blurRadius: 6,
                          ),
                        ],
                      ),
                      child: Column(  // Row에서 Column으로 변경하여 아이콘을 텍스트 위에 배치
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.person,
                            color: Colors.white,
                            size: 60, // 아이콘 크기 증가
                          ),
                          SizedBox(height: 10), // 아이콘과 텍스트 사이의 간격
                          Text(
                            '일반 사용자',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 24, // 폰트 크기
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
