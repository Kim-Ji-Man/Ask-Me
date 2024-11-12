import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/homepage.dart';
import 'package:flutter_askme/screens/initial.dart';
import 'package:flutter_askme/service/PushNotificationService.dart';
import 'package:flutter_askme/service/WebSocketProvider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:kakao_map_plugin/kakao_map_plugin.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

// GlobalKey로 NavigatorState 관리
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

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

  await dotenv.load(fileName: "assets/.env");

  HttpOverrides.global = MyHttpOverrides();

  String key = dotenv.get("KAKAOMAP_KEY");
  AuthRepository.initialize(appKey: key);
  runApp(const MyApp());
}

class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback = (X509Certificate cert, String host, int port) => true;
  }
}

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
          await _pushNotificationService.initOneSignal(userId,context); // context 없이 초기화 가능
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => WebSocketProvider(),
      child: MaterialApp(
        navigatorKey: navigatorKey, // GlobalKey 설정
        home: Initial(),
        theme: ThemeData(
          scaffoldBackgroundColor: Colors.white,
        ),
      ),
    );
  }
}