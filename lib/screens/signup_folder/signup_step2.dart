import 'package:flutter/material.dart';
import 'signup_step3.dart';
import 'package:provider/provider.dart'; // Provider 패키지 임포트
import 'package:flutter_askme/models/signup_data.dart';

class SignUpStep2 extends StatefulWidget {
  @override
  _SignUpStep2State createState() => _SignUpStep2State();
}

class _SignUpStep2State extends State<SignUpStep2> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _idController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  // 아이디 유효성 검사 함수
  String? validateUserId(String userId) {
    if (userId.isEmpty) {
      return '아이디를 입력해 주세요';
    }
    if (userId.length < 5) {
      return '아이디는 최소 5자 이상이어야 합니다';
    }
    if (userId.length > 20) {
      return '아이디는 최대 20자 이하여야 합니다';
    }

    final validCharacters = RegExp(r'^[a-zA-Z0-9]+$');
    if (!validCharacters.hasMatch(userId)) {
      return '아이디는 영문 대소문자와 숫자만 사용 가능합니다';
    }

    if (userId.contains(' ')) {
      return '아이디에 공백을 포함할 수 없습니다';
    }

    return null;
  }

  // 비밀번호 유효성 검사 함수
  String? validatePassword(String password) {
    if (password.isEmpty) {
      return '비밀번호를 입력해 주세요';
    }
    if (password.length < 8) {
      return '비밀번호는 최소 8자 이상이어야 합니다';
    }
    if (password.length > 20) {
      return '비밀번호는 최대 20자 이하여야 합니다';
    }

    final validCharacters = RegExp(r'^[a-zA-Z0-9]+$');
    if (!validCharacters.hasMatch(password)) {
      return '비밀번호는 영어와 숫자만 사용 가능합니다';
    }

    if (!RegExp(r'\d').hasMatch(password)) {
      return '비밀번호에는 최소한 하나의 숫자가 포함되어야 합니다';
    }

    if (!RegExp(r'[a-zA-Z]').hasMatch(password)) {
      return '비밀번호에는 최소한 하나의 영문자가 포함되어야 합니다';
    }

    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: Text(
          "회원가입",
          style: TextStyle(
            color: Colors.black,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                // 아이디 입력 필드
                TextFormField(
                  controller: _idController,
                  decoration: InputDecoration(labelText: '아이디'),
                  validator: (value) => validateUserId(value ?? ""),
                ),
                SizedBox(height: 16),
                // 비밀번호 입력 필드
                TextFormField(
                  controller: _passwordController,
                  obscureText: true, // 비밀번호 숨김
                  decoration: InputDecoration(labelText: '비밀번호'),
                  validator: (value) => validatePassword(value ?? ""),
                ),
                SizedBox(height: 16),
                // 비밀번호 확인 입력 필드
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: true, // 비밀번호 숨김
                  decoration: InputDecoration(labelText: '비밀번호 확인'),
                  validator: (value) {
                    if (value != _passwordController.text) {
                      return '비밀번호가 일치하지 않습니다';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 24,),
                Container(
                  width: double.infinity,
                  height: 60,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(0xFF0F148D),
                    ),
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        // SignUpData에 데이터를 저장
                        final signUpData =
                            Provider.of<SignUpData>(context, listen: false);
        
                        // 인스턴스 메서드 호출
                        signUpData.setStep2(
                          _idController.text, // 아이디 저장
                          _passwordController.text, // 비밀번호 저장
                        );
        
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => SignUpStep3(),
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('입력 정보를 다시 확인해 주세요.'),
                          ),
                        );
                      }
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
        ),
      ),
    );
  }
}
