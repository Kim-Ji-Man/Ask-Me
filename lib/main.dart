
import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/homepage.dart';
import 'package:flutter_askme/screens/initial.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:kakao_map_plugin/kakao_map_plugin.dart';


void main() async {
  await dotenv.load(fileName: "assets/.env");
  String key = dotenv.get("KAKAOMAP_KEY");
  AuthRepository.initialize(appKey: '$key');

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Homepage(),
      theme: ThemeData(
        scaffoldBackgroundColor: Colors.white, // 전체 배경색을 흰색으로 설정
      ),
    );
  }
}