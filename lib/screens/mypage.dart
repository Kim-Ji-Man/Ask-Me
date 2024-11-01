import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/mypage_folder/mycommentpage.dart';
import 'package:flutter_askme/screens/mypage_folder/mypostpage.dart';
import 'package:flutter_askme/screens/mypage_folder/noticepage.dart';
import 'package:flutter_askme/screens/mypage_folder/notificationsettings.dart';
import 'package:flutter_askme/screens/mypage_folder/usersupport.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'mypage_folder/myinfopage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_askme/screens/login.dart';


class Mypage extends StatefulWidget {
  @override
  _MypageState createState() => _MypageState();
}


class LogoutService {
  final String baseUrl = dotenv.get("BASE_URL");

  Future<void> logoutUser(BuildContext context) async {
    // 토큰을 가져와 헤더에 추가
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token == null) {
      // 토큰이 없으면 로그인 페이지로 이동
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => Login()),
      );
      return;
    }

    // 로그아웃 요청
    final response = await http.post(
      Uri.parse('$baseUrl/auth/logout'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      // 로그아웃 성공 시 토큰 삭제
      await prefs.remove('token');

      // 로그인 페이지로 이동
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => Login()),
      );
    } else {
      // 로그아웃 실패 시 에러 메시지 표시
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('로그아웃에 실패했습니다. 다시 시도해주세요.')),
      );
    }
  }
}

class _MypageState extends State<Mypage> {
  String nick = "닉네임";
  String username = "사용자아이디";
  String BaseUrl = dotenv.get("BASE_URL");

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    final userInfo = await fetchUserInfo();
    if (userInfo != null) {
      setState(() {
        nick = userInfo['nick'] ?? "닉네임";
        username = userInfo['username'] ?? "사용자이름";
      });
    }
  }

  Future<Map<String, String>?> fetchUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return null;

    final parts = token.split('.');
    if (parts.length != 3) throw Exception('Invalid token');

    final payload = json.decode(
      utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
    );
    print("JWT 페이로드 데이터: $payload");
    final userId = payload['userId'];
    print("Userid: $userId");
    final response = await http.get(Uri.parse('$BaseUrl/mypage/info/$userId'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      print("Fetched user data: $data"); // 디버깅 용도
      print("Nickname: ${data['nick']}, Username: ${data['username']}");


      return {
        "nick": data['nick'],
        "username": data['username'],
      };
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          '마이페이지',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
      ),
      body: ListView(
        children: [
          _buildProfileSection(),
          _buildOptionsSection(context),
          _buildAdBanner(),
          _buildListTiles(context),
        ],
      ),
    );
  }

  Widget _buildProfileSection() {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                nick,
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              Text(
                username,
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ],
          ),
          Spacer(),
          SizedBox(
            width: 80,
            child: ElevatedButton(
              onPressed: () {
                // 로그아웃 버튼 클릭 시 처리할 내용
              },
              child: Text('로그아웃'),
              style: ElevatedButton.styleFrom(
                foregroundColor: Colors.black,
                backgroundColor: Colors.blue[500],
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOptionsSection(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 20, horizontal: 10),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildOptionItem(Icons.campaign, '공지사항', context, NoticePage()),
          _buildOptionItem(Icons.person, '내 정보', context, MyInfoPage()),
          _buildOptionItem(Icons.notifications, '알림설정', context, NotificationSettings()),
        ],
      ),
    );
  }

  Widget _buildOptionItem(IconData icon, String label, BuildContext context, Widget? destinationPage) {
    return Column(
      children: [
        IconButton(
          icon: Icon(icon, size: 35, color: Colors.black),
          onPressed: () {
            if (destinationPage != null) {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => destinationPage),
              );
            }
          },
        ),
        SizedBox(height: 10),
        Text(label, style: TextStyle(fontSize: 12)),
      ],
    );
  }

  Widget _buildAdBanner() {
    return Container(
      margin: EdgeInsets.all(20),
      height: 150,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(10),
        image: DecorationImage(
          image: AssetImage('assets/banner.png'),
          fit: BoxFit.cover,
        ),
      ),
    );
  }

  Widget _buildListTiles(BuildContext context) {
    return Column(
      children: [
        _buildListTile('내가 작성한 글', Icons.article, context, MyPostPage(
          currentUserNickname: nick,
          allPosts: [],
        )),
        _buildListTile('내가 작성한 댓글', Icons.chat_outlined, context, MyCommentPage(
          currentUserNickname: nick,
          allComments: [],
        )),
        _buildListTile('고객 지원', Icons.headset_mic, context, UserSupport()),
      ],
    );
  }

  Widget _buildListTile(String title, IconData icon, BuildContext context, Widget destinationPage) {
    return ListTile(
      leading: Icon(icon, color: Colors.black),
      title: Text(title),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => destinationPage),
        );
      },
    );
  }
}
