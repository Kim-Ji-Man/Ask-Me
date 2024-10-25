import 'package:flutter/material.dart';

class Alert extends StatelessWidget {
  final bool isSecurity; // 경비원인지 일반 사용자 인지 확인

  const Alert({super.key, required this.isSecurity});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Align(
          alignment: Alignment.centerLeft,
          child: Text(
            '알림내역',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
        ),
        elevation: 0, // 그림자 제거
      ),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 4),
            Expanded(
              child: ListView(
                children: [
                  buildNotificationItem(
                      '1일 전', 'images/img_logo.png', '서울 강남구'),
                  buildNotificationItem(
                      '2일 전', 'images/img_logo.png', '서울 서초구'),
                  buildNotificationItem(
                      '5일 전', 'images/img_logo.png', '서울 송파구'),
                  buildNotificationItem(
                      '7일 전', 'images/img_logo.png', '서울 강동구'),
                  buildNotificationItem(
                      '10일 전', 'images/img_logo.png', '서울 종로구'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildNotificationItem(String timeAgo, String imagePath,
      String location) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Image.asset(
            isSecurity ? imagePath : 'images/img_logo.png',
            // 경비원은 감지된 사진, 일반 사용자는 로고
            width: 40,
            height: 40,
          ),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '흉기소지자 감지',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 4),
                Text(
                  '$location\n 근처에 위험 요소가 감지되었습니다. 주의를 기울여 주세요.',
                  style: TextStyle(fontSize: 14, color: Colors.black),
                ),
                SizedBox(height: 4), // 시간 정보와의 간격
                Text(
                  timeAgo,
                  style: TextStyle(
                      fontSize: 12, color: Colors.grey), // 시간 정보는 약간 작은 글씨와 회색
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
