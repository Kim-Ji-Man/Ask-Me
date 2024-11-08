import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/homepage.dart';
import 'package:flutter_askme/screens/initial.dart';
import 'package:flutter_askme/service/WebSocketProvider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:kakao_map_plugin/kakao_map_plugin.dart';
import 'package:provider/provider.dart'; // Provider 패키지 추가
import 'package:flutter_askme/models/signup_data.dart';


void main() async {
  await dotenv.load(fileName: "assets/.env");
  String key = dotenv.get("KAKAOMAP_KEY");
  String BaseUrl = dotenv.get("BASE_URL");
  AuthRepository.initialize(appKey: '$key');

  runApp(
    ChangeNotifierProvider(
      create: (context) => SignUpData(), // SignUpData 초기화
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => WebSocketProvider(), // WebSocketProvider를 전역으로 제공
      child: MaterialApp(
        home: Initial(),
        theme: ThemeData(
          scaffoldBackgroundColor: Colors.white, // 전체 배경색을 흰색으로 설정
        ),
      ),
    );
  }
}