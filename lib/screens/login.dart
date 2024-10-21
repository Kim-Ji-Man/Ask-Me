import 'package:flutter/material.dart';

class Login extends StatefulWidget {
  @override
  _LoginState createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final _formKey = GlobalKey<FormState>(); // Form의 상태를 추적하는 Key
  final TextEditingController _idController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _isLoading = false; // 로그인 중 로딩 상태 관리

  @override
  void dispose() {
    _idController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // 아이디 유효성 검사
  String? _validateId(String? value) {
    if (value == null || value.isEmpty) {
      return '아이디를 입력하세요';
    } else if (value.length < 4) { // 아이디가 최소 4자 이상이어야 한다는 예시 조건
      return '아이디는 최소 4자 이상이어야 합니다';
    }
    return null;
  }

  // 비밀번호 유효성 검사
  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return '비밀번호를 입력하세요';
    } else if (value.length < 8) {
      return '비밀번호는 최소 8자 이상이어야 합니다';
    }
    return null;
  }

  // 로그인 처리 로직 (예시: 네트워크 요청)
  Future<void> _login() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        // 네트워크 요청 예시 (실제 API 요청 코드는 추가해야 함)
        await Future.delayed(Duration(seconds: 2)); // 로딩 중 시뮬레이션
        print('로그인 성공');
        // 서버에서 로그인 성공 시 처리
      } catch (error) {
        print('로그인 실패: $error');
        // 에러 처리
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey, // Form에 GlobalKey 연결
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: <Widget>[
              Container(
                alignment: Alignment.center,
                child: Image.asset(
                  'images/img_logo2.png',
                  fit: BoxFit.contain,
                  width: 170,
                  height: 170,
                ),
              ),
              SizedBox(height: 10),
              // 아이디 입력 필드
              Container(
                padding: EdgeInsets.symmetric(horizontal: 16.0),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: TextFormField(
                  controller: _idController,
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    labelText: '아이디 입력',
                  ),
                  validator: _validateId,
                ),
              ),
              SizedBox(height: 20),
              // 비밀번호 입력 필드
              Container(
                padding: EdgeInsets.symmetric(horizontal: 16.0),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: TextFormField(
                  controller: _passwordController,
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    labelText: '비밀번호 입력',
                  ),
                  obscureText: true,
                  validator: _validatePassword,
                ),
              ),
              SizedBox(height: 20),
              // 로그인 버튼
              _isLoading
                  ? CircularProgressIndicator() // 로딩 중일 때 보여줄 로딩 표시
                  : ElevatedButton(
                onPressed: _login,
                child: Text(
                  '로그인',
                  style: TextStyle(color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 50),
                  backgroundColor: Color(0xFF0F148D),
                ),
              ),
              SizedBox(height: 20),
              GestureDetector(
                onTap: () {
                  // 비밀번호 찾기 로직 추가
                  print('비밀번호 찾기 페이지로 이동');
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
      ),
    );
  }
}
