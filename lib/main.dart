
import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/homepage.dart';
import 'package:kakao_map_plugin/kakao_map_plugin.dart';
import 'package:flutter_askme/screens/initial.dart';

void main() {
  AuthRepository.initialize(appKey: 'eabeaca4a43cd3074cf89096380991b2');
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Initial(),
    );
  }
}