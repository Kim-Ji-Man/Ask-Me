import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart'; // 토큰 저장을 위한 패키지
import 'package:flutter_askme/screens/homepage.dart';
import 'package:provider/provider.dart';

import '../service/WebSocketProvider.dart'; // Provider 패키지 추가


class Login extends StatefulWidget {
  @override
  _LoginState createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final _formKey = GlobalKey<FormState>(); // Form의 상태를 추적하는 Key
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String BaseUrl = dotenv.get("BASE_URL");
  bool _isLoading = false; // 로그인 중 로딩 상태 관리
  String _message = '';

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // 로그인 처리 로직
  Future<void> loginUser(String username, String password) async {
    setState(() {
      _isLoading = true;
    });

    final response = await http.post(
      Uri.parse('$BaseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // 토큰 저장
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);

      final webSocketProvider =
      Provider.of<WebSocketProvider>(context, listen: false);

      final token = prefs.getString('token');

      if (token != null) {
        webSocketProvider.connectWebSocket(username, token); // WebSocket 연결 시 토큰 전달
      }
      // 로그인 성공 시 홈 페이지로 이동
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => Homepage()),
      );
    } else {
      setState(() {
        _message = '로그인 실패';
      });
    }

    setState(() {
      _isLoading = false; // 로딩 상태 업데이트
    });
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
              TextFormField(
                controller: _usernameController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: '아이디',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '아이디를 입력하세요';
                  }
                  return null;
                },
              ),
              SizedBox(height: 20),
              // 비밀번호 입력 필드
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: '비밀번호',
                ),
                obscureText: true,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '비밀번호를 입력하세요';
                  } else if (value.length < 4) {
                    return '비밀번호는 최소 4자 이상이어야 합니다';
                  }
                  return null;
                },
              ),
              SizedBox(height: 20),
              // 로그인 버튼
              _isLoading
                  ? CircularProgressIndicator() // 로딩 중일 때 보여줄 로딩 표시
                  : ElevatedButton(
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          loginUser(
                            _usernameController.text,
                            _passwordController.text,
                          );
                        }
                      },
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
              Text(
                _message,
                style: TextStyle(color: Colors.red),
              ),
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
