import 'package:flutter/material.dart';
import 'alert.dart';
import 'community.dart';
import 'location.dart';
import 'mypage.dart';

class Homepage extends StatefulWidget {
  @override
  State<Homepage> createState() => _HomepageState();
}

class _HomepageState extends State<Homepage> {
  int _selectedIndex = 0; // 현재 선택된 페이지 인덱스
  bool isSecurity = true; // 경비원 여부 설정 (경비원이면 true, 일반 사용자면 false)

  // 페이지 리스트에서 isSecurity 값을 Alert 페이지에 전달
  List<Widget> _pages() => [
    HomePageContent(),
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
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.right,
                  ),
                  SizedBox(height: 16),
                  SizedBox(
                    height: MediaQuery.of(context).size.height * 0.25,
                    child: PageView.builder(
                      controller: _pageController,
                      onPageChanged: (index){
                        if (index == 0) {
                          Future.delayed(Duration(milliseconds: 300), () {
                          _pageController.jumpToPage(_totalPages);
                          });
                        } else if (index == _totalPages +1){
                          Future.delayed(Duration(milliseconds: 300),(){
                            _pageController.jumpToPage(1);
                          });
                        }
                      },
                      itemCount: _totalPages + 2 ,
                      itemBuilder: (context, index) {
                        if (index == 0) {
                        return buildCard(context, _totalPages - 1);
                      } else if (index == _totalPages +1) {
                          return buildCard(context, 0);
                      } else {
                          return buildCard(context, index - 1);
                        }
                     },
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 24),
            Text(
              '알림내역',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Expanded(
              child: ListView(
                children: [
                  buildNotificationItem('1일 전', Icons.camera_alt),
                  buildNotificationItem('2일 전', Icons.camera_alt),
                  buildNotificationItem('5일 전', Icons.camera_alt),
                  buildNotificationItem('7일 전', Icons.camera_alt),
                  buildNotificationItem('10일 전', Icons.camera_alt),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildNotificationItem(String timeAgo, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, size: 30, color: Colors.black), // 아이콘 색상 검정
          SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('흉기소지자 감지',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              Text(timeAgo),
            ],
          ),
        ],
      ),
    );
  }

  Widget buildCard(BuildContext context, int index) {
    List<String> imagePaths = [
      'images/card1.png',
      'images/card2.png',
      'images/card3.png',
      'images/card4.png',
      'images/card5.png',
    ];

    return Card(
      color: Colors.white, // 카드 배경 흰색
      elevation: 4, // 카드의 그림자 높이
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15), // 모서리 둥글게
      ),
      child: SizedBox(
        width: double.infinity, // Card가 최대한 넓게 확장
        height: 200, // Card의 높이를 설정
        child: Image.asset(
         imagePaths[index],
          fit: BoxFit.cover, // 이미지를 Card에 꽉 차게 함
        ),
      ),
    );
  }
}