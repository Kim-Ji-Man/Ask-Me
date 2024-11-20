import 'package:flutter/material.dart';
import 'signup_step1.dart'; // 경비원 회원가입 페이지 추가
import 'package:flutter_askme/models/signup_data.dart';
import 'package:provider/provider.dart';

class SignUp extends StatefulWidget {
  @override
  _SignUpState createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> {
  void _saveRole(bool isGuard) {
    // Provider를 통해 role 값 설정
    Provider.of<SignUpData>(context, listen: false).setUserType(isGuard);
  }

  @override
  Widget build(BuildContext context) {
    // 화면 크기 가져오기
    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      backgroundColor: Colors.white, // 밝은 회색 배경으로 변경
      appBar: AppBar(
        backgroundColor: Colors.white, // 흰색 헤더
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new),
          color: Colors.black,
          onPressed: () {
            Navigator.pop(context); // 이전 화면으로 돌아가기
          },
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              Center(
                child: Text(
                  '사용자 가입 유형을 선택하세요',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: Colors.black, // 검정 텍스트 색상
                  ),
                ),
              ),
              SizedBox(height: 50),
              // 사용자 유형 선택 버튼
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    GestureDetector(
                      onTap: () {
                        // 경비원 버튼 클릭 시 role을 guard로 저장하고 signup_step1.dart로 이동
                        _saveRole(true);
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) =>
                                  SignUpStep1(isGuard: true)),
                        );
                      },
                      child: Container(
                        padding: EdgeInsets.all(20),
                        width: screenWidth * 0.7, // 화면 너비의 70% 차지
                        height: screenHeight * 0.25, // 화면 높이의 25% 차지로 줄임
                        decoration: BoxDecoration(
                          color: Color(0xFFF5F5F5), // 밝은 회색 버튼 배경
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(
                              color: Color(0xFF0F148D), width: 2), // 남색 테두리 추가
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black26,
                              offset: Offset(4, 6),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.security,
                              color: Color(0xFF0F148D),
                              size: 50, // 아이콘 크기 소폭 줄임
                            ),
                            SizedBox(height: 10),
                            Text(
                              '경비원',
                              style: TextStyle(
                                color: Color(0xFF0F148D),
                                fontSize: 22,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: 30),
                    GestureDetector(
                      onTap: () {
                        // 일반 사용자 버튼 클릭 시 role을 user로 저장하고 signup_step1.dart로 이동
                        _saveRole(false);
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) =>
                                  SignUpStep1(isGuard: false)), // 일반 사용자
                        );
                      },
                      child: Container(
                        padding: EdgeInsets.all(20),
                        width: screenWidth * 0.7,
                        height: screenHeight * 0.25,
                        decoration: BoxDecoration(
                          color: Color(0xFF0F148D),
                          borderRadius: BorderRadius.circular(30),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black26,
                              offset: Offset(4, 6),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.person,
                              color: Colors.white,
                              size: 50,
                            ),
                            SizedBox(height: 10),
                            Text(
                              '일반 사용자',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.w500,
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
      ),
    );
  }
}

