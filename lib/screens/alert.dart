import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

class Alert extends StatefulWidget {
  final bool isSecurity;

  const Alert({super.key, required this.isSecurity});

  @override
  _AlertState createState() => _AlertState();
}

class _AlertState extends State<Alert> {
  String? userRole;
  String baseUrl = dotenv.get("BASE_URL");
  List<dynamic> alerts = []; // 알림 데이터를 저장할 리스트

  @override
  void initState() {
    super.initState();
    loadUserRole();
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
    print("JWT 페이로드 데이터: $payload");
    userRole = payload['role'];
    print("userRole: $userRole");

    final response = await http.get(Uri.parse('$baseUrl/Alim/app/$userRole'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      print("Fetched alim data: $data"); // 디버깅 용도
      setState(() {
        alerts = data;
        // Sort alerts by detection_time in descending order
        alerts.sort((a, b) => DateTime.parse(b['detection_time']).compareTo(DateTime.parse(a['detection_time'])));
      });
    }
  }

  String formatTimeAgo(String detectionTime) {
    DateTime detectedTime = DateTime.parse(detectionTime);
    Duration difference = DateTime.now().difference(detectedTime);

    if (difference.inDays > 0) {
      return '${difference.inDays}일 전';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}시간 전';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}분 전';
    } else {
      return '방금 전';
    }
  }

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
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 4),
            // Text(
            //   '현재 사용자 역할: ${userRole ?? "알 수 없음"}', // 역할 출력
            //   style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            // ),
            Expanded(
              child: ListView.builder(
                itemCount: alerts.length,
                itemBuilder: (context, index) {
                  final alert = alerts[index];
                  return buildNotificationItem(
                    formatTimeAgo(alert['detection_time']),
                    alert['image_path'],
                    alert['address'] ?? '주소 정보 없음',
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildNotificationItem(String timeAgo, String? imagePath, String location) {
    // 이미지 경로가 null이 아니면 localhost URL로 변환
    String imageUrl = imagePath != null ? '$baseUrl$imagePath' : 'images/img_logo.png';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Image.network(
            widget.isSecurity ? imageUrl : 'images/img_logo.png',
            width: 40,
            height: 40,
            errorBuilder: (context, error, stackTrace) => Icon(Icons.error), // 이미지 로드 실패 시 대체 아이콘
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
                SizedBox(height: 4),
                Text(
                  timeAgo,
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}