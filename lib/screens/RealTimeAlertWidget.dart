import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart'; // 날짜 포맷팅을 위해 사용
import '../service/WebSocketProvider.dart';
import 'dart:convert'; // JSON 파싱을 위해 필요

class RealTimeAlertWidget extends StatefulWidget {
  @override
  _RealTimeAlertWidgetState createState() => _RealTimeAlertWidgetState();
}

class _RealTimeAlertWidgetState extends State<RealTimeAlertWidget> {

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance?.addPostFrameCallback((_) {
      final webSocketProvider = Provider.of<WebSocketProvider>(context, listen: false);

      if (webSocketProvider.isLoggedIn) {
        print("WebSocket 연결 성공: 로그인 상태입니다.");

        webSocketProvider.addListener(() {
          if (webSocketProvider.messages.isNotEmpty) {
            final lastMessage = webSocketProvider.messages.last;

            // 메시지를 파싱하여 필요한 데이터 추출
            final messageData = parseMessage(lastMessage);

            // .env 파일에서 baseUrl 가져오기
            String baseUrl = dotenv.get("BASE_URL");
            final imageUrl = '$baseUrl${messageData['imageUrl']}';
            print("새로운 메시지 수신: $lastMessage"); // 디버깅용 메시지 출력

            // AlertDialog로 메시지를 표시
            showDialog(
              context: context,
              builder: (BuildContext context) {
                return AlertDialog(
                  title: Text('실시간 알림'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Image.network(imageUrl), // 서버에서 이미지 가져오기
                      SizedBox(height: 10),
                      Text(
                        '가게명: ${messageData['storeName']}',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ), // 가게명 표시
                      SizedBox(height: 5),
                      Text(
                        '감지 시간: ${formatDateTime(messageData['detectionTime'])}',
                        style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                      ), // 감지 시간 표시
                    ],
                  ),
                  actions: [
                    TextButton(
                      child: Text('확인'),
                      onPressed: () {
                        Navigator.of(context).pop(); // 다이얼로그 닫기
                      },
                    ),
                  ],
                );
              },
            );
          }
        });
      } else {
        print("WebSocket 연결 실패: 로그인 상태가 아닙니다.");
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(); // 이 위젯은 UI에 아무것도 그리지 않음 (단순히 AlertDialog 트리거 역할)
  }

  // WebSocket에서 받은 JSON 메시지를 파싱하는 함수
  Map<String, dynamic> parseMessage(String message) {
    try {
      // JSON 문자열을 Map으로 변환
      final Map<String, dynamic> decodedMessage = jsonDecode(message);

      // 필요한 값들을 추출하여 반환
      return {
        'imageUrl': decodedMessage['imageUrl'], // 서버에서 받은 이미지 URL
        'storeName': decodedMessage['storeName'], // 서버에서 받은 가게명
        'detectionTime': decodedMessage['detectionTime'], // 서버에서 받은 감지 시간
      };
    } catch (e) {
      print("메시지 파싱 실패: $e");
      return {};
    }
  }

  // 감지 시간을 포맷팅하는 함수 (ISO8601 형식 -> 보기 좋은 형식으로 변환)
  String formatDateTime(String dateTimeString) {
    try {
      DateTime dateTime = DateTime.parse(dateTimeString);
      return DateFormat('yyyy년 MM월 dd일 HH:mm').format(dateTime); // 원하는 형식으로 변환
    } catch (e) {
      print("시간 포맷팅 실패: $e");
      return dateTimeString; // 포맷팅 실패 시 원본 반환
    }
  }
}