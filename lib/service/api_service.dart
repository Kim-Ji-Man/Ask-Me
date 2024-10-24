// lib/services/api_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  final String baseUrl;

  ApiService(this.baseUrl);

  // GET 요청을 통해 데이터를 가져오는 메서드
  Future<Map<String, dynamic>> fetchData() async {
    try {
      final response = await http.get(Uri.parse(baseUrl));

      // 요청이 성공적인 경우
      if (response.statusCode == 200) {
        return json.decode(response.body); // JSON 데이터를 파싱하여 반환
      } else {
        throw Exception('Failed to load data: ${response.statusCode}'); // 오류 처리
      }
    } catch (e) {
      throw Exception('Error: $e'); // 예외 처리
    }
  }
}
