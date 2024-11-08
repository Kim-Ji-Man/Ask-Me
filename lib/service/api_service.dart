import 'package:dio/dio.dart';

class ApiService {
  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: 'http://10.0.2.2:5000',  // 서버 기본 URL
      connectTimeout: Duration(milliseconds: 5000),  // 연결 타임아웃 설정
      receiveTimeout: Duration(milliseconds: 3000),  // 응답 타임아웃 설정
    ),
  );

  Future<Map<String, dynamic>?> signUp({
    int? storeId, // int 타입으로 변경
    required String nick,
    required String email,
    required String username,
    required String password,
    required String phoneNumber,
    required String name,
    required String gender,
    required String birth,
    required String role,
  }) async {
    final data = {
      if (storeId != null) 'storeId': storeId, // storeId가 있으면 그대로 int로 추가
      'nick': nick,
      'username': username,
      'email': email,
      'password': password,
      'phone_number': phoneNumber,
      'mem_name': name,
      'gender': gender,
      'birth': birth,
      'role': role,
    };

    try {
      final response = await _dio.post('/auth/register', data: data);
      if (response.statusCode == 201) {
        return response.data;
      } else {
        print("data입니다 $data");

        print("회원가입 실패: ${response.statusCode}");
        return null;
      }
    } on DioError catch (e) {
      if (e.response != null) {
        print("data입니다 $data");

        print("서버 오류: ${e.response?.data}");
      } else {
        print("네트워크 오류: $e");
      }
      return null;
    }
  }
}
