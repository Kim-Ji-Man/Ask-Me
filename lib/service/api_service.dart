import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiService {
  late String BaseUrl;
  late final Dio _dio;

  ApiService() {
    // dotenv에서 BASE_URL을 가져와서 초기화
    BaseUrl = dotenv.get("BASE_URL");

    // Dio 인스턴스를 생성자에서 초기화
    _dio = Dio(
      BaseOptions(
        baseUrl: BaseUrl, // 서버 기본 URL
        connectTimeout: Duration(milliseconds: 5000), // 연결 타임아웃 설정
        receiveTimeout: Duration(milliseconds: 3000), // 응답 타임아웃 설정
      ),
    );
  }

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

// 아이디 찾기 API 요청
  Future<String?> findId(String idName, String idPhoneNumber) async {
    try {
      final response = await _dio.post('/find/id', data: {
        'mem_name': idName,
        'phone_number': idPhoneNumber,
      });

      // 디버깅 코드 추가
      print("아이디 찾기 요청 데이터: {mem_name: $idName, phone_number: $idPhoneNumber}");
      print("응답 상태 코드: ${response.statusCode}");
      print("응답 본문: ${response.data}");

      if (response.statusCode == 200) {
        return response.data['username']; // 서버 응답에서 아이디 반환
      } else {
        print("아이디 찾기 실패: ${response.statusCode}");
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

// 비밀번호 재설정 API 요청
  Future<String?> resetPassword(String id, String phoneNumber) async {
    try {
      final response = await _dio.post('/find/password', data: {
        'username': id,
        'phone_number': phoneNumber,
      });

      // 디버깅 코드
      print("응답 상태 코드: ${response.statusCode}");
      print("응답 전체 본문: ${response.data}");

      // 키 존재 여부 확인
      if (response.data.containsKey('tempPassword')) {
        print("응답에서 가져온 임시 비밀번호: ${response.data['tempPassword']}");
        return response.data['tempPassword'];
      } else {
        print("응답 본문에 'tempPassword' 키가 없습니다.");
        return null;
      }
    } catch (e) {
      print("오류 발생: $e");
      return null;
    }
  }
}