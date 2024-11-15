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
  Future<void> logoutUser(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => Login()),
    );
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
    final userId = payload['userId'];
    final response = await http.get(Uri.parse('$BaseUrl/mypage/info/$userId'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
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
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black),
        ),
        centerTitle: true,
        iconTheme: IconThemeData(color: Colors.black),
      ),
      body: ListView(
        padding: EdgeInsets.all(16),
        children: [
          _buildProfileSection(),
          SizedBox(height: 20),
          _buildQuickActions(context),
          SizedBox(height: 20),
          _buildAdBanner(),
          SizedBox(height: 20),
          _buildActivityTiles(context),
        ],
      ),
    );
  }

  Widget _buildProfileSection() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: Colors.grey[300],
            child: Icon(Icons.person, size: 30, color: Colors.white),
          ),
          SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                nick,
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              Text(
                username,
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ],
          ),
          Spacer(),
          ElevatedButton(
            onPressed: () {
              final logoutService = LogoutService();
              logoutService.logoutUser(context);
            },
            child: Text('로그아웃'),
            style: ElevatedButton.styleFrom(
              foregroundColor: Colors.white,
              backgroundColor: Colors.indigo[800],
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildQuickActionItem(Icons.campaign, '공지사항', context, NoticePage()),
        _buildQuickActionItem(Icons.person, '내 정보', context, MyInfoPage()),
        _buildQuickActionItem(Icons.notifications, '알림설정', context, NotificationSettings()),
      ],
    );
  }

  Widget _buildQuickActionItem(IconData icon, String label, BuildContext context, Widget destinationPage) {
    return Column(
      children: [
        IconButton(
          icon: Icon(icon, size: 32, color: Colors.indigo[800]),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => destinationPage),
            );
          },
        ),
        SizedBox(height: 8),
        Text(label, style: TextStyle(fontSize: 12)),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(
        title,
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey[800]),
      ),
    );
  }


  Widget _buildAdBanner() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 10),
      height: 150,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(12),
        image: DecorationImage(
          image: AssetImage('assets/banner.png'),
          fit: BoxFit.cover,
        ),
      ),
    );
  }



  Widget _buildActivityTiles(BuildContext context) {
    return Column(
      children: [
        _buildListTile('내가 작성한 글', Icons.article, context, MyPostPage()),
        _buildListTile('내가 작성한 댓글', Icons.chat_outlined, context, MyCommentPage()),
        _buildListTile('고객 지원', Icons.support_agent, context, UserSupport()),
      ],
    );
  }


  Widget _buildListTile(String title, IconData icon, BuildContext context, Widget destinationPage) {
    return ListTile(
      contentPadding: EdgeInsets.symmetric(horizontal: 20),
      leading: Icon(icon, color: Colors.indigo[800]),
      title: Text(title, style: TextStyle(fontSize: 16)),
      trailing: Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => destinationPage),
        );
      },
    );
  }
}
