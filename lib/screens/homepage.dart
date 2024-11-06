import 'package:flutter/material.dart';
import 'alert.dart';
import 'community.dart';
import 'location.dart';
import 'mypage.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';


// JWT 토큰을 디코딩하는 함수
Future<void> decodeAndPrintToken() async {
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');

  if (token == null) {
    print("토큰이 저장되지 않았습니다.");
    return;
  }

  // JWT는 점(.)으로 구분된 세 가지 부분으로 구성됩니다.
  final parts = token.split('.');
  if (parts.length != 3) {
    print("유효하지 않은 토큰 형식입니다.");
    return;
  }

  // payload 부분(두 번째)을 디코딩합니다.
  final payload = json.decode(
    utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
  );

  print("JWT 페이로드 데이터: $payload");
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
  String baseUrl = dotenv.get("BASE_URL");
  @override
  void initState() {
    super.initState();
    decodeAndPrintToken(); // 토큰 디코딩 및 출력
    loadUserRole(); // 사용자 역할에 따른 알림 데이터 로드
  }

  Future<void> loadUserRole() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return;

    final parts = token.split('.');
    if (parts.length != 3) throw Exception('Invalid token');

    final payload = json.decode(
      utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
    );
    String userRole = payload['role'];
    print("userRole: $userRole");

    // 서버에서 사용자 역할에 맞는 알림 데이터를 가져옴
    final response = await http.get(Uri.parse('$baseUrl/Alim/app/Home/$userRole'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      print("Fetched alim data: $data"); // 디버깅 용도
      setState(() {
        alerts = data;
        // detection_time 기준으로 내림차순 정렬
        alerts.sort((a, b) => DateTime.parse(b['detection_time']).compareTo(DateTime.parse(a['detection_time'])));
      });
    }
  }

  List<Widget> _pages() => [
    HomePageContent(alerts: alerts), // 알림 데이터를 전달하여 표시
    Alert(isSecurity: isSecurity), // 경비원 권한에 따라 알림 표시
    Location(),
    Community(),
    Mypage(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: _pages()[_selectedIndex], // 네비게이션에 따라 페이지를 선택
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: Colors.white, // 배경색 흰색
        selectedItemColor: Colors.black, // 선택된 아이템 색상 검정
        unselectedItemColor: Colors.grey, // 선택되지 않은 아이템 색상 회색
        type: BottomNavigationBarType.fixed,
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.home), label: '홈'),
          BottomNavigationBarItem(icon: Icon(Icons.notifications), label: '알림 내역'),
          BottomNavigationBarItem(icon: Icon(Icons.location_on), label: '내 근처'),
          BottomNavigationBarItem(icon: Icon(Icons.comment), label: '커뮤니티'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: '마이페이지'),
        ],
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}

class HomePageContent extends StatelessWidget {
  final PageController _pageController = PageController(initialPage: 1);
  final int _totalPages = 5;
  final List<dynamic> alerts; // 서버에서 받아온 알림 데이터를 저장
  String baseUrl = dotenv.get("BASE_URL");

  HomePageContent({required this.alerts});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0, // 그림자 제거
        centerTitle: true,
        title: Image.asset(
          'images/img_logo2.png',
          height: 70,
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '위기 대응 지침',
                    style:
                    TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.right,
                  ),
                  SizedBox(height: 16),
                  SizedBox(
                    height:
                    MediaQuery.of(context).size.height * 0.25,
                    child:
                    PageView.builder(
                      controller:
                      _pageController,
                      onPageChanged:
                          (index) {
                        if (index ==0){
                          Future.delayed(Duration(milliseconds:
                          300), () {
                            _pageController.jumpToPage(_totalPages);
                          });
                        } else if (index ==
                            _totalPages +1){
                          Future.delayed(Duration(milliseconds:
                          300),(){
                            _pageController.jumpToPage(1);
                          });
                        }
                      },
                      itemCount:
                      _totalPages +2 ,
                      itemBuilder:
                          (context,index){
                        if (index ==0){
                          return buildCard(context,_totalPages -1);
                        } else if (index ==
                            _totalPages +1){
                          return buildCard(context,0);
                        } else{
                          return buildCard(context,index -1);
                        }
                      },
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height:
            24),
            Text(
              '알림내역',
              style:
              TextStyle(fontSize:
              16, fontWeight:
              FontWeight.bold),
            ),
            SizedBox(height:
            8),
            Expanded(
              child:
              ListView.builder(
                itemCount:
                alerts.length,
                itemBuilder:
                    (context,index){
                  final alert =
                  alerts[index];
                  return buildNotificationItem(alert);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildNotificationItem(dynamic alert) {
    // Check if 'image_url' is null and provide a fallback
    String? imagePath = alert['image_path'];  // Fetch the image path from alert
    String baseUrl = dotenv.get("BASE_URL"); // Get base URL from environment variables

    // Construct the full image URL or fallback to a local asset
    String imageUrl = imagePath != null ? '$baseUrl$imagePath' : 'images/img_logo.png';

    // Format the time ago string
    String timeAgo = formatTimeAgo(alert['detection_time']);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          // Use Image.network for server images and Image.asset for local fallback
          imagePath != null
              ? Image.network(imageUrl, width: 50, height: 50, fit: BoxFit.cover)
              : Image.asset(imageUrl, width: 50, height: 50, fit: BoxFit.cover),
          SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('흉기소지자감지', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              Text(timeAgo),
            ],
          ),
        ],
      ),
    );
  }

  Widget buildCard(BuildContext context,int index){
    List<String>
    imagePaths=[
      'images/card1.png',
      'images/card2.png',
      'images/card3.png',
      'images/card4.png',
      'images/card5.png',
    ];

    return Card(color:
    Colors.white,elevation:
    4,shape:
    RoundedRectangleBorder(borderRadius:
    BorderRadius.circular(15)),
      child:SizedBox(width:
      double.infinity,height:
      200,child:
      Image.asset(imagePaths[index],fit:
      BoxFit.cover),
      ),
    );
  }
}

String formatTimeAgo(String detectionTime){
  DateTime detectedTime=
  DateTime.parse(detectionTime);
  Duration difference=
  DateTime.now().difference(detectedTime);

  if(difference.inDays>0){
    return'${difference.inDays}일 전';
  }else if(difference.inHours>0){
    return'${difference.inHours}시간 전';
  }else if(difference.inMinutes>0){
    return'${difference.inMinutes}분 전';
  }else{
    return'방금 전';
  }
}