import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'dart:convert';

class WebSocketProvider with ChangeNotifier {
  late WebSocketChannel channel;
  List<String> messages = [];
  String baseSocket = dotenv.get("BASE_SOCKET");
  bool isLoggedIn = false; // 로그인 여부를 확인하는 변수
  String? jwtToken; // JWT 토큰 저장 변수

  // 로그인 후 JWT 토큰을 저장하고 WebSocket 연결
  void connectWebSocket(String userId, String token) {
    if (isLoggedIn) return; // 이미 로그인되어 있으면 중복 연결 방지

    jwtToken = token; // JWT 토큰 저장
    print("WebSocket 서버에 연결 시도 중...");

    // WebSocket 서버에 연결 (Node.js 서버 주소 입력)
    try {
      // JWT 토큰을 URL 쿼리 파라미터로 추가
      final uri = Uri.parse('ws://$baseSocket/?token=$jwtToken');
      channel = WebSocketChannel.connect(uri);

      print("WebSocket 서버에 연결되었습니다.");
    } catch (e) {
      print("WebSocket 연결 실패: $e");
      return;
    }

    // 서버로부터 메시지를 수신할 때 처리
    channel.stream.listen(
          (message) {
        if (message == null || message.isEmpty) {
          print("서버로부터 빈 메시지 또는 null 수신됨."); // 메시지가 없거나 빈 값일 때
          return;
        }

        print("서버로부터 메시지 수신: $message"); // 수신된 원본 메시지 출력

        try {
          final decodedMessage = jsonDecode(message); // JSON 형식으로 디코딩

          if (decodedMessage == null || decodedMessage.isEmpty) {
            print("디코딩된 메시지가 비어 있음."); // 디코딩 후 빈 값일 때
            return;
          }

          if (decodedMessage['type'] == 'alert') {
            messages.add(jsonEncode(decodedMessage));
            print("디코딩된 메시지 추가됨: ${messages.last}"); // 디코딩된 메시지 출력
          }
        } catch (e) {
          print("메시지 디코딩 중 오류 발생: $e"); // JSON 디코딩 오류 발생 시 로그 출력
        }

        notifyListeners(); // UI 업데이트를 위해 알림 전송
      },
      onError: (error) {
        print("WebSocket 오류 발생: $error"); // 오류 발생 시 로그 출력
      },
      onDone: () {
        print("WebSocket 연결이 종료되었습니다."); // 연결 종료 시 로그 출력
      },
      cancelOnError: true,
    );

    isLoggedIn = true; // 로그인 상태로 변경
    notifyListeners();
  }

  void disconnectWebSocket() {
    if (!isLoggedIn) return;

    print("WebSocket 연결 종료 중...");

    channel.sink.close();
    isLoggedIn = false; // 로그아웃 상태로 변경

    print("WebSocket 연결이 종료되었습니다.");

    notifyListeners();
  }
}