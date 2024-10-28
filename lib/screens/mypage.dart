import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/mypage_folder/noticepage.dart';
import 'mypage_folder/myinfopage.dart';

class Mypage extends StatelessWidget {
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
          // 상단 프로필 정보
          Container(
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
                      '메롱',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'merong',
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
          ),

          // 필목 목록
          Container(
            padding: EdgeInsets.symmetric(vertical: 20, horizontal: 10),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildOptionItem(Icons.campaign, '공지사항', context),
                _buildOptionItem(Icons.person, '내 정보', context),
                _buildOptionItem(Icons.notifications, '알림설정', context),
              ],
            ),
          ),

          // 광고 배너
          Container(
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
          ),

          // 리스트 항목
          _buildListTile('내가 작성한 글', Icons.article),
          _buildListTile('내가 작성한 댓글', Icons.chat_outlined),
          _buildListTile('고객 지원', Icons.headset_mic),
        ],
      ),
    );
  }

  Widget _buildOptionItem(IconData icon, String label, BuildContext context) {
    return Column(
      children: [
        IconButton(
          icon: Icon(icon, size: 35, color: Colors.black),
          onPressed: () {
            if (label == '내 정보') {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => MyInfoPage()), // 내 정보 수정 페이지로 이동
              );
            } else if (label == '공지사항') {
              Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => NoticePage()),
              );
            }
          },
        ),
        SizedBox(height: 10),
        Text(label, style: TextStyle(fontSize: 12)),
      ],
    );
  }

  Widget _buildListTile(String title, IconData icon) {
    return ListTile(
      leading: Icon(icon, color: Colors.black),
      title: Text(title),
      onTap: () {
        // 리스트 항목 클릭 시 처리할 내용 추가
      },
    );
  }
}