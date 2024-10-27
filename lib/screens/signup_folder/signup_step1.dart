import 'package:flutter/material.dart';
import 'signup_step2.dart'; // 새로 만든 페이지를 임포트합니다.

class SignUpStep1 extends StatefulWidget {
  final bool isGuard; // 경비원인지 여부를 전달하기 위한 변수

  SignUpStep1({this.isGuard = true}); // 기본값은 true로 설정

  @override
  _SignUpStep1State createState() => _SignUpStep1State();
}

class _SignUpStep1State extends State<SignUpStep1> {
  final TextEditingController _storeNameController = TextEditingController();
  final TextEditingController _nicknameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  void _onNextButtonPressed() {
    // 다음 버튼 클릭 시 signup_step2 페이지로 이동
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => SignUpStep2()), // 일반 사용자일 때도 signup_step2로 이동
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
        title: Text("회원가입"),
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
          children: [
            // 매장명 입력 필드 (경비원인 경우에만 보이게)
            if (widget.isGuard) ...[
              TextField(
                controller: _storeNameController,
                decoration: InputDecoration(labelText: '매장명'),
              ),
              SizedBox(height: 16),
            ],
            // 닉네임 입력 필드
            TextField(
              controller: _nicknameController,
              decoration: InputDecoration(labelText: '닉네임'),
            ),
            SizedBox(height: 16),
            // 이메일 입력 필드
            TextField(
              controller: _emailController,
              decoration: InputDecoration(labelText: '이메일'),
            ),
            Spacer(),
            Container(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF0F148D), // 버튼 색상
                ),
                onPressed: _onNextButtonPressed, // 다음 버튼 클릭 시 동작
                child: Text(
                  '다음',
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
