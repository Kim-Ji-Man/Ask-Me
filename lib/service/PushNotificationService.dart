import 'dart:convert';
import 'package:flutter/material.dart'; // Navigator 사용을 위해 추가
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:onesignal_flutter/onesignal_flutter.dart';
import 'package:http/http.dart' as http;
import '../main.dart';
import '../screens/alert.dart'; // Alert 페이지 import

class PushNotificationService {
  String? _externalUserId;
  String BaseUrl = dotenv.get("BASE_URL");

  // OneSignal 초기화 함수
  Future<void> initOneSignal(String userId, BuildContext context) async { // userId와 context를 매개변수로 받음
    // 환경변수에서 OneSignal 앱 ID 가져오기
    String oneSignalAppId = dotenv.get('ONESIGNAL_APP_ID', fallback: '12ccc718-9cd7-489a-8744-5b735de9034b');

    // OneSignal 초기화
    OneSignal.initialize(oneSignalAppId);

    // 사용자에게 알림 권한 요청
    await OneSignal.Notifications.requestPermission(true);

    // 포그라운드 알림을 수신할 때의 핸들러
    OneSignal.Notifications.addForegroundWillDisplayListener((event) {
      print('포그라운드 알림 수신: ${event.notification.jsonRepresentation()}');

      // 추가 데이터에서 이미지 경로 추출
      String? imageUrl = event.notification.additionalData?['image_path'];
      print('$imageUrl 어떻게 나오니 이미지 야');
      if (imageUrl != null) {
        // 이미지가 포함된 경우 처리
        print('이미지 URL: $imageUrl');
      }

      // 기본적으로 포그라운드 알림 표시를 막음
      event.preventDefault();
    });

    // 알림 클릭 이벤트 핸들러 (클릭 시 특정 화면으로 이동)
    OneSignal.Notifications.addClickListener((event) {
      print('알림이 클릭됨: ${event.notification.title}');
      _handleNotificationClick(event.notification);  // context 전달
    });

    // 서버에서 외부 사용자 ID 가져오기 및 로그인 처리 (userId 전달)
    await fetchExternalUserIdAndLogin(userId); // userId 전달
  }

  // 서버에서 외부 사용자 ID 가져오기 및 로그인 처리 함수
  Future<void> fetchExternalUserIdAndLogin(String userId) async {
    try {
      final response = await http.post(
        Uri.parse('$BaseUrl/setExternalUserIdOnServer'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'userId': userId}),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        _externalUserId = responseData['external_user_id'];
        print("서버에서 받은 외부 사용자 ID: $_externalUserId");

        // OneSignal에 로그인 시도 (외부 사용자 ID 사용)
        _handleLogin();
      } else {
        print('서버에서 외부 사용자 ID를 가져오는 데 실패했습니다.');
      }

    } catch (e) {
      print('외부 사용자 ID 가져오기 실패: $e');
    }
  }

  // OneSignal 로그인 처리 함수 (새로운 external_user_id 설정)
  void _handleLogin() {
    if (_externalUserId == null) return;

    print("Setting external user ID in OneSignal: $_externalUserId");

    // OneSignal에 로그인 시도 (외부 사용자 ID 사용)
    OneSignal.login(_externalUserId!);

    // 사용자에게 "fb_id"라는 별칭을 부여 (예시)
    OneSignal.User.addAlias("fb_id", "1341524");
  }

  // 로그아웃 시 external_user_id 제거 함수
  Future<void> logoutFromOneSignal() async {
    try {
      await OneSignal.logout();
      print('이전 external_user_id가 성공적으로 제거되었습니다.');
    } catch (e) {
      print('external_user_id 제거 실패: $e');
    }
  }

  // 푸시 알림 클릭 시 처리 함수 (특정 화면으로 이동)
  void _handleNotificationClick(OSNotification notification) {
    String? screen = notification.additionalData?['screen'];

    if (screen != null && screen == 'Alert') {
      print('알림 클릭 후 Alert 페이지로 이동');

      // GlobalKey를 사용하여 Navigator로 페이지 이동
      navigatorKey.currentState?.push(
        MaterialPageRoute(
          builder: (context) => Alert(isSecurity: true),
        ),
      );
    } else {
      print('알림 클릭 후 이동할 화면 정보가 없습니다.');
    }
  }
}