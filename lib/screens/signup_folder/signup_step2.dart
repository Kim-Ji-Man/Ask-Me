import 'package:flutter/material.dart';
import 'signup_step3.dart'; // signup_step3.dart를 임포트합니다.

class SignUpStep2 extends StatefulWidget {
  @override
  _SignUpStep2State createState() => _SignUpStep2State();
}

class _SignUpStep2State extends State<SignUpStep2> {
  TextEditingController _idController = TextEditingController();
  TextEditingController _passwordController = TextEditingController();
  TextEditingController _confirmPasswordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // 배경색을 흰색으로 설정
      appBar: AppBar(
        backgroundColor: Colors.white, // 앱바 배경색을 흰색으로 설정
        title: Text(
          "회원가입",
          style: TextStyle(
            color: Colors.black, // 앱바 텍스트 색상을 검정색으로 설정
          ),
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // 아이디 입력 필드
            TextField(
              controller: _idController,
              decoration: InputDecoration(labelText: '아이디'),
            ),
            SizedBox(height: 16),
            // 비밀번호 입력 필드
            TextField(
              controller: _passwordController,
              obscureText: true, // 비밀번호 숨김
              decoration: InputDecoration(labelText: '비밀번호'),
            ),
            SizedBox(height: 16),
            // 비밀번호 확인 입력 필드
            TextField(
              controller: _confirmPasswordController,
              obscureText: true, // 비밀번호 숨김
              decoration: InputDecoration(labelText: '비밀번호 확인'),
            ),
            Spacer(),
            Container(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF0F148D), // 버튼 색상
                ),
                onPressed: () {
                  // 다음 페이지로 이동
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => SignUpStep3(),
                    ),
                  );
                },
                child: Text(
                  "다음",
                  style: TextStyle(fontSize: 18, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
