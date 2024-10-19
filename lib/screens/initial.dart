import 'package:flutter/material.dart';
import 'signup.dart'; // 회원가입 페이지 추가
import 'login.dart';

class Initial extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Login Page',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: InitialScreen(),
    );
  }
}

class InitialScreen extends StatefulWidget {
  @override
  _InitialScreenState createState() => _InitialScreenState();
}

class _InitialScreenState extends State<InitialScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            Spacer(),
            Column(
              children: [
                Image.asset(
                  'images/img_logo.png',
                  width: 120,
                  height: 120,
                  fit: BoxFit.cover,
                ),
                SizedBox(height: 20),
                Text(
                  'Ask Me',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
                SizedBox(height: 10),
                Text(
                  '위험을 미리 감지하고,\n당신의 안전을 지켜드리겠습니다!',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black,
                  ),
                ),
              ],
            ),
            Spacer(),
            Column(
              children: [
                // 카카오톡 가입하기 버튼을 위로 이동
                ElevatedButton(
                  onPressed: () {
                    // 카카오톡 가입하기 동작 추가
                    // 여기에 카카오톡 가입하기 로직을 추가하세요
                  },
                  child: Text(
                    '카카오톡으로 시작하기',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size(double.infinity, 50),
                    backgroundColor: Color(0xFF0F148D), // 기존 버튼과 동일한 색상
                  ),
                ),
                SizedBox(height: 20),
                // 가입하기 버튼을 아래로 이동
                ElevatedButton(
                  onPressed: () {
                    // 회원가입 페이지로 이동
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => SignUp()), // SignUp으로 이동
                    );
                  },
                  child: Text(
                    '가입하기',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    minimumSize: Size(double.infinity, 50),
                    backgroundColor: Color(0xFF0F148D),
                  ),
                ),
                SizedBox(height: 20),
                GestureDetector(
                  onTap: () {
                    // 로그인 페이지로 이동
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => Login()),
                    );
                  },
                  child: RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: '이미 계정이 있나요? ',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                        TextSpan(
                          text: '로그인',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.black,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: 30),
              ],
            ),
          ],
        ),
      ),
    );
  }
}