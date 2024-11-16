import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class NotificationSettings extends StatefulWidget {
  @override
  _NotificationSettingsState createState() => _NotificationSettingsState();
}

class _NotificationSettingsState extends State<NotificationSettings> {
  bool isPushNotificationEnabled = false;
  bool isNewCommentNotificationEnabled = false;
  bool isLocationServiceEnabled = false;
  String? userId;
  String baseUrl = dotenv.get("BASE_URL");

  @override
  void initState() {
    super.initState();
    _fetchNotificationSettings(); // 초기 설정 불러오기
  }

  Future<String?> _getUserIdFromToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return null;

    final parts = token.split('.');
    if (parts.length != 3) throw Exception('Invalid token');

    // JWT 페이로드 디코딩
    final payload = json.decode(
      utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
    );

    // userId가 정수형일 경우 문자열로 변환
    final userId = payload['userId'];

    // 만약 userId가 int라면 문자열로 변환
    if (userId is int) {
      return userId.toString(); // 정수를 문자열로 변환하여 반환
    } else if (userId is String) {
      return userId; // 이미 문자열인 경우 그대로 반환
    } else {
      throw Exception('Unexpected userId type');
    }
  }

  Future<void> _fetchNotificationSettings() async {
    userId = await _getUserIdFromToken();
    if (userId == null) return;

    final response = await http.get(Uri.parse('$baseUrl/Member/push/$userId')); // userId 사용
    print("$response 알림데이타");

    if (response.statusCode == 200) {
      setState(() {
        final data = json.decode(response.body);
        print("$data 알림데이타");
        isPushNotificationEnabled = data['push_alert'] == 1; // 서버에서 받은 push_alert 값 사용
      });
    } else {
      // 에러 처리
      print('Failed to load settings');
    }
  }

  // 서버에 알림 설정을 업데이트하는 함수
  Future<void> _updatePushNotificationSetting(bool newValue) async {
    userId = await _getUserIdFromToken();
    if (userId == null) return;

    try {
      // 요청 전 데이터를 출력
      print('Sending request to update push notification setting...');
      print('User ID: $userId');
      print('Push alert value: ${newValue ? 1 : 0}');

      final response = await http.post(
        Uri.parse('$baseUrl/Member/push/update/$userId'), // userId 사용
        body: json.encode({
          'push_alert': newValue ? 1 : 0, // 정수형으로 전송
        }),
        headers: {"Content-Type": "application/json"},
      );

      // 응답 상태 코드 출력
      print('Response status code: ${response.statusCode}');

      // 응답 본문 출력
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        // 서버 응답이 성공적일 때만 상태 업데이트
        setState(() {
          isPushNotificationEnabled = newValue; // 상태 업데이트 후 UI 갱신
        });
        print('Push notification setting updated successfully.');
      } else {
        // 에러 처리
        print('Failed to update settings. Status code: ${response.statusCode}');
        print('Error response body: ${response.body}');
      }
    } catch (e) {
      print('Error occurred while updating settings: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: Text('알림설정'),
        backgroundColor: Colors.white,
      ),
      body: Container(
        color: Colors.white,
        child: ListView(
          padding: EdgeInsets.all(16),
          children: [
            ListTile(
              title: Text('푸시 알림',
                style: TextStyle(
                  fontWeight: FontWeight.bold,),
              ),
              subtitle: Text('푸시알림에 대한 설정은 아이폰 알림센터에서 확인 하실 수 있습니다.',
                style: TextStyle(
                  fontSize: 12,
                ),
              ),
              trailing: Switch(
                value: isPushNotificationEnabled,
                onChanged: (value) {
                  setState(() { // 상태 변경 시 UI 갱신을 위해 setState 호출
                    _updatePushNotificationSetting(value);
                  });
                },
                activeColor: Colors.white,
                inactiveThumbColor: Colors.grey,
                activeTrackColor:
                isPushNotificationEnabled ? Colors.blue[500] : Colors.grey[200], // 조건에 따라 색상 변경
                inactiveTrackColor: Colors.grey[200],
              ),
            ),
          ],
        ),
      ),
    );
  }
}