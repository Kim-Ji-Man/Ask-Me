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
    String? storeId, // 변경
    required String nick, // nickname -> nick으로 변경
    required String email,
    required String username,
    required String password,
    required String phoneNumber, // 추가
    required String name, // mem_name에 해당
    required String gender,
    required String birth,
    required String role, // userType을 role로 변경
  }) async {
    final data = {
      'storeId': storeId,  // guard일 경우에만 설정
      'nick': nick, // nickname -> nick으로 변경
      'username': username, // 서버에서 기대하는 필드 이름으로 전달
      'email': email,
      'password': password,
      'phone_number': phoneNumber, // 추가된 필드
      'mem_name': name, // 변경된 필드 이름
      'gender': gender,
      'birth': birth,
      'role': role, // 변경된 필드 이름
    };

    try {
      final response = await _dio.post('/auth/register', data: data); // POST 요청 전송
      if (response.statusCode == 201) { // 201 상태 코드 확인
        return response.data;
      } else {
        print("회원가입 실패: ${response.statusCode}");
        return null;
      }
    } on DioError catch (e) {
      if (e.response != null) {
        print("서버 오류: ${e.response?.data}");
      } else {
        print("네트워크 오류: $e");
      }
      return null;
    }
  }
}
