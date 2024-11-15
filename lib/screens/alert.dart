import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

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
  int? selectedIndex; // 선택된 항목 인덱스

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
        automaticallyImplyLeading: false, // 화살표 아이콘 제거
        title: Align(
          alignment: Alignment.centerLeft, // 왼쪽 정렬
          child: Text(
            '알림내역',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0), // 좌우 20px, 상하 24px 여백
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ListView.builder(
                itemCount: alerts.length,
                itemBuilder: (context, index) {
                  final alert = alerts[index];
                  return buildNotificationItem(
                    formatTimeAgo(alert['detection_time']),
                    alert['image_path'],
                    alert['address'] ?? '주소 정보 없음',
                    alert['detection_time'],
                    index,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildNotificationItem(String timeAgo, String? imagePath, String location, String detectionTime, int index) {
    String imageUrl = imagePath != null ? '$baseUrl$imagePath' : 'images/img_logo.png';
    bool isSelected = selectedIndex == index;

    return GestureDetector(
      onTap: () {
        setState(() {
          selectedIndex = index; // 선택된 항목을 갱신하여 배경색 변경
        });
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => AlertDetails(
              imageUrl: widget.isSecurity ? imageUrl : 'images/img_logo.png',
              location: location,
              detectionTime: detectionTime,
            ),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.blue[50], // 선택된 항목이면 화이트, 아니면 옅은 하늘색
          borderRadius: BorderRadius.circular(12), // 둥근 네모 모양
        ),
        padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 12.0),
        margin: const EdgeInsets.symmetric(vertical: 4.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                widget.isSecurity ? imageUrl : 'images/img_logo.png',
                width: 50,
                height: 50,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Icon(Icons.error),
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '흉기소지자 감지',
                    style: TextStyle(fontSize: 14),
                  ),
                  SizedBox(height: 4),
                  Text(
                    '$location',
                    style: TextStyle(fontSize: 15, color: Colors.indigo[800], fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 4),
                  Text(
                    '근처에 위험 요소가 감지되었습니다. 주의를 기울여 주세요.',
                    style: TextStyle(fontSize: 14),
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
      ),
    );
  }
}

class AlertDetails extends StatelessWidget {
  final String imageUrl;
  final String location;
  final String detectionTime;

  const AlertDetails({
    Key? key,
    required this.imageUrl,
    required this.location,
    required this.detectionTime,
  }) : super(key: key);

  String formatExactDateTime(String detectionTime) {
    try {
      DateTime dateTime = DateTime.parse(detectionTime);
      return DateFormat('yyyy-MM-dd HH:mm:ss').format(dateTime);
    } catch (e) {
      print("Date parsing error: $e");
      return detectionTime;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          '알림 세부 정보',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Colors.black),
        ),
        elevation: 0,
        centerTitle: true,
      ),
      backgroundColor: Colors.white,
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(height: 30),
            Center(
              child: Container(
                height: 250,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(16),
                ),
                clipBehavior: Clip.antiAlias,
                child: imageUrl != 'images/img_logo.png'
                    ? Image.network(
                  imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Center(
                    child: Text(
                      '이미지를 불러올 수 없습니다.',
                      style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                      textAlign: TextAlign.center,
                    ),
                  ),
                )
                    : Image.asset(
                  'images/img_logo.png',
                  fit: BoxFit.cover,
                ),
              ),
            ),
            SizedBox(height: 50),
            buildInfoText('📍 발생 위치', location),
            SizedBox(height: 30),
            buildInfoText('⏰ 감지 일시', formatExactDateTime(detectionTime)),
          ],
        ),
      ),
    );
  }

  Widget buildInfoText(String title, String content) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: 8),
        Text(
          content,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.indigo[800],
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}