import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/find_id_password.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart'; // 토큰 저장을 위한 패키지
import 'package:flutter_askme/screens/homepage.dart';
import 'package:provider/provider.dart';
import '../service/PushNotificationService.dart';
import '../service/WebSocketProvider.dart'; // Provider 패키지 추가

class ApprovalPendingPage extends StatelessWidget {
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
        title: Text('승인 대기 중'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock, size: 100, color: Colors.grey),
            SizedBox(height: 20),
            Text(
              '관리자 승인 후 이용 가능합니다.',
              style: TextStyle(fontSize: 18),
            ),
            SizedBox(height: 10),
            Text(
              '승인이 완료될 때까지 기다려주세요.',
              style: TextStyle(fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }
}




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


  String? extractUserIdFromToken(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) {
        throw Exception('Invalid token');
      }
      final payload = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
      final payloadMap = json.decode(payload);
      return payloadMap['userId']?.toString();
    } catch (e) {
      print('토큰에서 userId 추출 실패: $e');
      return null;
    }
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
      print("어떻게 나오니??? $data");
      if (data['account_status'] == 'inactive') {
        // account_status가 inactive일 경우 승인 대기 페이지로 이동
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => ApprovalPendingPage()),
        );
        return; // 더 이상 진행하지 않음
      }


      // 토큰 저장
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);

      String? userId = extractUserIdFromToken(data['token']);

      final token = prefs.getString('token');
      print("저장된 JWT 토큰: $token");
      if (token != null) {
        String? userId = extractUserIdFromToken(token); // JWT 토큰에서 userId 추출

        if (userId != null) {

          final webSocketProvider = Provider.of<WebSocketProvider>(context, listen: false);
          webSocketProvider.connectWebSocket(userId, data['token']);

          PushNotificationService pushService = PushNotificationService();

          // initOneSignal을 호출하기 전에 userId를 사용하여 fetchExternalUserIdAndLogin을 호출
          await pushService.initOneSignal(userId,context); // userId 전달
        }
      }
      // 로그인 성공 시 홈 페이지로 이동
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => Homepage()),
      );
    } else {
      setState(() {
        _message = '로그인 실패';
        print('로그인 실패: ${response.statusCode}');
        print('서버 응답: ${response.body}');
      });
    }

    setState(() {
      _isLoading = false; // 로딩 상태 업데이트
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true, // 키보드가 올라오면 자동으로 화면 조정
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
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
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
                SizedBox(height: 40),
                _isLoading
                    ? CircularProgressIndicator()
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
                    style: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size(double.infinity, 50),
                    backgroundColor: Color(0xFF0F148D),
                  ),
                ),
                Text(
                  _message,
                  style: TextStyle(color: Colors.red),
                ),
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => FindIdPasswordPage()),
                    );
                  },
                  child: Text(
                    '아이디/비밀번호 찾기',
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
      ),
    );
  }
}
