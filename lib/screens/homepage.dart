import 'package:flutter/material.dart';
import 'RealTimeAlertWidget.dart';
import 'alert.dart';
import 'community_folder/community.dart';
import 'location.dart';
import 'login.dart';
import 'mypage.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'mypage_folder/mycommentpage.dart';
import 'mypage_folder/myinfopage.dart';
import 'mypage_folder/mypostpage.dart';
import 'mypage_folder/noticepage.dart';
import 'mypage_folder/notificationsettings.dart';
import 'mypage_folder/usersupport.dart';

// JWT 토큰을 디코딩하는 함수
Future<void> decodeAndPrintToken() async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');

  if (token == null) {
    print("토큰이 저장되지 않았습니다.");
    return;
  }

  final parts = token.split('.');
  if (parts.length != 3) {
    print("유효하지 않은 토큰 형식입니다.");
    return;
  }

  final payload = json.decode(
    utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
  );

  print("JWT 페이로드 데이터: $payload");
}

class LogoutService {
  Future<void> logoutUser(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token'); // 토큰 삭제
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => Login()), // 로그인 페이지로 이동
    );
  }
}

class Homepage extends StatefulWidget {
  @override
  State<Homepage> createState() => _HomepageState();
}

class _HomepageState extends State<Homepage> {
  int _selectedIndex = 0; // 현재 선택된 페이지 인덱스
  bool isSecurity = true; // 경비원 여부 설정 (경비원이면 true, 일반 사용자면 false)
  List<dynamic> alerts = []; // 서버에서 받아온 알림 데이터를 저장할 리스트
  String? userRole;
  String? nick = "사용자"; // 기본 닉네임 설정
  String baseUrl = dotenv.get("BASE_URL");
  int totalAlerts = 0;
  int todayAlerts = 0;

  @override
  void initState() {
    super.initState();
    decodeAndPrintToken(); // 토큰 디코딩 및 출력
    loadUserRole(); // 사용자 역할에 따른 알림 데이터 로드
    _loadUserProfile(); // 사용자 프로필 정보 로드
  }


  Future<void> loadUserRole() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return;

    // JWT 토큰에서 payload 추출
    final parts = token.split('.');
    if (parts.length != 3) throw Exception('Invalid token');

    final payload = json.decode(
      utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
    );
    String userRole = payload['role'];

    // 디버깅 용도로 URL 출력
    print("Requesting URL: $baseUrl/Alim/app/Count/$userRole");

    // 서버에서 사용자 역할에 맞는 알림 데이터를 가져옴
    try {
      final response = await http.get(Uri.parse('$baseUrl/Alim/app/Count/$userRole'));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print("Fetched alim data: $data"); // 디버깅 용도

        setState(() {
          totalAlerts = data['total_count']; // 전체 알림 수 저장
          todayAlerts = data['today_count']; // 오늘의 알림 수 저장
        });

      } else if (response.statusCode == 404) {
        print('No data found for the given role.');

      } else {
        print('Failed to fetch data. Status code: ${response.statusCode}');
      }

    } catch (e) {
      print('Error fetching data: $e');
    }
  }

  Future<void> _loadUserProfile() async {
    final userInfo = await fetchUserInfo();
    if (userInfo != null) {
      setState(() {
        nick = userInfo['nick'] ?? "사용자"; // 닉네임 값을 가져와서 설정
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
    final response = await http.get(Uri.parse('$baseUrl/mypage/info/$userId'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return {
        "nick": data['nick'],
        "username": data['username'],
      };
    }
    return null;
  }

  List<Widget> _pages() => [
    HomePageContent(alerts: alerts, nick: nick ?? "사용자", totalAlerts: totalAlerts, todayAlerts: todayAlerts),
    Alert(isSecurity: isSecurity), // 경비원 권한에 따라 알림 표시
    Location(),
    Community(),
    // Mypage(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });

    // '홈' 버튼이 눌렸을 때 데이터를 새로 가져오기
    if (index == 0) {
      // 홈 버튼이 눌렸을 때 데이터 새로고침
      loadUserRole();      // 사용자 역할에 따른 알림 데이터 다시 로드
      _loadUserProfile();  // 사용자 프로필 정보 다시 로드
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.indigo[800], // 전체 배경 색상 설정
      body: Stack(
        children: [
          _pages()[_selectedIndex], // 네비게이션에 따라 페이지를 선택
          RealTimeAlertWidget(), // 실시간 알림 위젯 추가 (화면 전체에서 작동)
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: Colors.white, // 배경색 흰색
        selectedItemColor: Colors.indigo[800], // 선택된 아이템 색상
        unselectedItemColor: Colors.grey, // 선택되지 않은 아이템 색상
        type: BottomNavigationBarType.fixed,
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.home), label: '홈'),
          BottomNavigationBarItem(icon: Icon(Icons.notifications), label: '알림 내역'),
          BottomNavigationBarItem(icon: Icon(Icons.location_on), label: '내 근처'),
          BottomNavigationBarItem(icon: Icon(Icons.comment), label: '커뮤니티'),
          // BottomNavigationBarItem(icon: Icon(Icons.person), label: '마이페이지'),
        ],
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}

class HomePageContent extends StatelessWidget {
  final List<dynamic> alerts; // 서버에서 받아온 알림 데이터를 저장
  final String nick; // 닉네임 값
  final int totalAlerts;
  final int todayAlerts;

  HomePageContent({
    required this.alerts,
    required this.nick,
    required this.totalAlerts,
    required this.todayAlerts,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          // 상단 색상 배경 영역을 대체하는 'AppBar' 형태의 Container
          Container(
            color: Colors.indigo[800],
            padding: EdgeInsets.fromLTRB(20, 24, 20, 10), // 위쪽 여백 추가
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Image.asset(
                    'images/logo2.png', // 로고 이미지
                    height: 50, // 로고 크기 조정
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.logout, color: Colors.white),
                  onPressed: () {
                    final logoutService = LogoutService();
                    logoutService.logoutUser(context);
                  },
                ),
              ],
            ),
          ),
          // 상단 색상 배경 아래에 프로필 영역 추가
          Container(
            width: double.infinity,
            padding: EdgeInsets.fromLTRB(20, 40, 20, 40),
            color: Colors.indigo[800], // 배경색을 상단과 맞춤
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: MediaQuery.of(context).size.width * 0.08, // 화면 너비에 따라 동적 크기
                  backgroundColor: Colors.grey[300],
                  child: Icon(Icons.person, color: Colors.white),
                ),
                SizedBox(width: MediaQuery.of(context).size.width * 0.04), // 여백 반응형
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$nick 님,',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: MediaQuery.of(context).size.width * 0.06,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '안녕하세요',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: MediaQuery.of(context).size.width * 0.04,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // 흰색 배경의 카드 영역
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(height: MediaQuery.of(context).size.width * 0.11),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: MediaQuery.of(context).size.width * 0.4,
                        child: _buildCard(
                          context,
                          '전체 알림수',
                          '$totalAlerts',
                          Icons.notifications_active,
                          Color(0xFF569BFA),
                        ),
                      ),
                      SizedBox(width: 20),
                      SizedBox(
                        width: MediaQuery.of(context).size.width * 0.4,
                        child: _buildCard(
                          context,
                          '당일 알림수',
                          '$todayAlerts',
                          Icons.notifications_active,
                          Color(0xFF569BFA),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: MediaQuery.of(context).size.height * 0.025),
                  _buildMenuGrid(context),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(BuildContext context, title, String subtitle, IconData iconData, Color bgColor) {
    return Container(
      margin: EdgeInsets.symmetric(vertical: 4),
      decoration: BoxDecoration(
        color: bgColor.withOpacity(0.15), // 전체 박스 배경색 설정
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(MediaQuery.of(context).size.width * 0.03),
            decoration: BoxDecoration(
              color: bgColor, // 상단 부분에 같은 배경색 설정
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Icon(iconData, size: MediaQuery.of(context).size.width * 0.05, color: Colors.white),
          ),
          // 텍스트 부분
          Padding(
            padding: EdgeInsets.symmetric(
              vertical: MediaQuery.of(context).size.height * 0.015, // 런타임 계산
              horizontal: MediaQuery.of(context).size.width * 0.02,
            ),
            child: Column(
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: MediaQuery.of(context).size.width * 0.035,
                    color: Colors.grey[800],
                  ),
                ),
                SizedBox(height: MediaQuery.of(context).size.height * 0.005),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: MediaQuery.of(context).size.width * 0.065,
                    fontWeight: FontWeight.bold,
                    color: Colors.indigo,
                    fontFamily: 'CustomFont',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 메뉴 그리드
  Widget _buildMenuGrid(BuildContext context) {
    List<Map<String, dynamic>> menuItems = [
      {"icon": Icons.campaign, "label": "공지사항", "color": Colors.red, "page": NoticePage()},
      {"icon": Icons.person, "label": "내정보", "color": Colors.indigo, "page": MyInfoPage()},
      {"icon": Icons.notifications, "label": "알림설정", "color": Colors.orange, "page": NotificationSettings()},
      {"icon": Icons.article, "label": "내가작성한글", "color": Colors.teal, "page": MyPostPage()},
      {"icon": Icons.question_answer, "label": "내가작성한댓글", "color": Colors.indigoAccent, "page": MyCommentPage()},
      {"icon": Icons.support_agent, "label": "고객지원", "color": Colors.purple, "page": UserSupport()},
    ];

    return GridView.count(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      crossAxisCount: 3,
      childAspectRatio: 0.95,
      children: menuItems.map((item) {
        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => item["page"]),
            );
          },
          child: Column(
            children: [
              Container(
                width: MediaQuery.of(context).size.width * 0.175,
                height: MediaQuery.of(context).size.width * 0.175,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(
                  item['icon'],
                  size: MediaQuery.of(context).size.width * 0.07,
                  color: item['color'], // 각 아이콘 색상 설정
                ),
              ),
              SizedBox(height: MediaQuery.of(context).size.width * 0.02),
              Text(
                item['label'],
                style: TextStyle(fontSize: MediaQuery.of(context).size.width * 0.03),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
