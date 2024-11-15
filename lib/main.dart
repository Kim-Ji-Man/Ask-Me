import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/homepage.dart';
import 'package:flutter_askme/screens/initial.dart';
import 'package:flutter_askme/service/PushNotificationService.dart';
import 'package:flutter_askme/screens/login.dart';
import 'package:flutter_askme/screens/signup_folder/signup_step2.dart';
import 'package:flutter_askme/screens/signup_folder/signup_step3.dart';
import 'package:flutter_askme/service/WebSocketProvider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:kakao_map_plugin/kakao_map_plugin.dart';
import 'package:provider/provider.dart';
import 'package:flutter_askme/screens/login.dart';
import 'package:flutter_askme/screens/signup_folder/signup_step2.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'models/signup_data.dart';

// GlobalKey로 NavigatorState 관리
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

// JWT 토큰에서 userId 추출 함수
String? extractUserIdFromToken(String token) {
  try {
    final parts = token.split('.');
    if (parts.length != 3) {
      throw Exception('Invalid token');
    }
    final payload = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
    final payloadMap = json.decode(payload);
    return payloadMap['userId']?.toString(); // JWT의 payload에서 userID 추출
  } catch (e) {
    print('토큰에서 userID 추출 실패: $e');
    return null;
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // .env 파일 로드
  await dotenv.load(fileName: "assets/.env");

  // HTTP 인증서 무시 설정
  HttpOverrides.global = MyHttpOverrides();

  // KakaoMap API 키 초기화
  String key = dotenv.get("KAKAOMAP_KEY");
  AuthRepository.initialize(appKey: key);

  // MultiProvider로 여러 Provider 설정
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => SignUpData()), // SignUpData Provider
        ChangeNotifierProvider(create: (context) => WebSocketProvider()), // WebSocketProvider
      ],
      child: const MyApp(),
    ),
  );
}

// HTTP 인증서 무시 클래스
class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback = (X509Certificate cert, String host, int port) => true;
  }
}

// MyApp 클래스 정의
class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final PushNotificationService _pushNotificationService = PushNotificationService();

  @override
  void initState() {
    super.initState();

    // Push Notification Service 초기화
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token != null) {
        String? userId = extractUserIdFromToken(token);

        if (userId != null) {
          await _pushNotificationService.initOneSignal(userId, context); // context 전달하여 초기화
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      navigatorKey: navigatorKey, // GlobalKey 설정
      home: Initial(), // 초기 화면 설정
      theme: ThemeData(
        scaffoldBackgroundColor: Colors.white, // 테마 설정
      ),
    );
  }
}