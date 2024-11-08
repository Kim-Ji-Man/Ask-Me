import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/homepage.dart';
import 'package:flutter_askme/screens/initial.dart';
import 'package:flutter_askme/screens/signup_folder/signup_step2.dart';
import 'package:flutter_askme/screens/signup_folder/signup_step3.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:kakao_map_plugin/kakao_map_plugin.dart';
import 'package:provider/provider.dart'; // provider 패키지 추가
import 'package:flutter_askme/models/signup_data.dart'; // SignUpData 클래스 임포트

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
    return MaterialApp(
      home: Initial(),
      theme: ThemeData(
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
        ),
        scaffoldBackgroundColor: Colors.white, // 전체 배경색을 흰색으로 설정
      ),
    );
  }
}
