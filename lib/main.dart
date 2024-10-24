
import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/initial.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        scaffoldBackgroundColor: Colors.white, // 전체 배경 색상 흰색으로 설정
      ),
      home: Initial(),
    );
  }
}