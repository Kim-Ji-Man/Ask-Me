import 'package:flutter/material.dart';

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
                  width: 80, // 버튼 가로 길이 설정
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
                _buildOptionItem(Icons.receipt, '공지사항', context),
                _buildOptionItem(Icons.person, '내 정보', context), // 내 정보 클릭 시 회원정보 수정 페이지로 이동
                _buildOptionItem(Icons.notifications, '알림설정', context),
              ],
            ),
          ),

          // 광고 배너
          Container(
            margin: EdgeInsets.all(16),
            height: 150,
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(10),
              image: DecorationImage(
                image: AssetImage('assets/banner.png'), // 배너 이미지 경로
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

  // 필목 옵션 아이템 생성 함수
  Widget _buildOptionItem(IconData icon, String label, BuildContext context) {
    return Column(
      children: [
        IconButton(
          icon: Icon(icon, size: 30, color: Colors.black),
          onPressed: () {
            if (label == '내 정보') {
              // 내 정보 클릭 시 회원정보 수정 페이지로 이동
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => MyInfoPage()),
              );
            }
          },
        ),
        SizedBox(height: 10),
        Text(label, style: TextStyle(fontSize: 12)),
      ],
    );
  }

  // 리스트 항목 생성 함수
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

// 회원정보 수정 페이지
class MyInfoPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: Text('개인정보 관리'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            SizedBox(height: 10),
            _buildInfoRow('이름', '홍길동'),
            SizedBox(height: 30),
            _buildInfoRow('닉네임', '메롱'),
            SizedBox(height: 30),
            _buildInfoRow('아이디', 'merong'),
            SizedBox(height: 30),
            _buildInfoRow('비밀번호 변경', '*******'),
            SizedBox(height: 30),
            _buildInfoRow('이메일', 'merong@gmail.com'),
            SizedBox(height: 30),
            _buildInfoRow('생년월일', '1997년 1월 15일' ),
            SizedBox(height: 30),
            _buildInfoRow('휴대폰 번호', '010-1234-5678'),
            SizedBox(height: 30),
            _buildInfoRow('매장명(경비원)', '매장명 입력'),
          ],
        ),
      ),
    );
  }

  // 기본 정보 표시 행
  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        Text(
          value,
          style: TextStyle(fontSize: 16, color: Colors.grey),
        ),
      ],
    );
  }

  // 생년월일 드롭다운
  Widget _buildDropDownRow(String label, String year, String month, String day) {
    return Row(
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        SizedBox(width: 10),
        DropdownButton<String>(
          value: year,
          items: ['1990년', '1991년', '1992년'].map((String value) {
            return DropdownMenuItem<String>(
              value: value,
              child: Text(value),
            );
          }).toList(),
          onChanged: (newValue) {
            // 생년월일 선택 처리
          },
        ),
        SizedBox(width: 10),
        DropdownButton<String>(
          value: month,
          items: ['1월', '2월', '3월'].map((String value) {
            return DropdownMenuItem<String>(
              value: value,
              child: Text(value),
            );
          }).toList(),
          onChanged: (newValue) {
            // 월 선택 처리
          },
        ),
        SizedBox(width: 10),
        DropdownButton<String>(
          value: day,
          items: ['1일', '2일', '3일'].map((String value) {
            return DropdownMenuItem<String>(
              value: value,
              child: Text(value),
            );
          }).toList(),
          onChanged: (newValue) {
            // 일 선택 처리
          },
        ),
      ],
    );
  }
}
