import 'package:flutter/material.dart';
import '../../service/api_service.dart';

class FindIdPasswordPage extends StatefulWidget {
  @override
  _FindIdPasswordPageState createState() => _FindIdPasswordPageState();
}

class _FindIdPasswordPageState extends State<FindIdPasswordPage> {
  bool isIdSelected = true; // 아이디 찾기와 비밀번호 찾기 탭 전환용 변수
  TextEditingController nameController = TextEditingController();
  TextEditingController phoneController = TextEditingController();
  TextEditingController idController = TextEditingController(); // 아이디 입력 필드 컨트롤러
  final ApiService apiService = ApiService(); // ApiService 인스턴스 생성

  Future<void> findId() async {
    // 요청 전에 입력된 데이터 출력
    print("보내는 데이터: {mem_name: ${nameController.text}, phone_number: ${phoneController.text}}");

    // API 호출 후 응답 데이터 출력
    try {
      String? userId = await apiService.findId(
        nameController.text,
        phoneController.text,
      );

      // 응답 데이터 출력
      print("서버 응답 데이터: $userId");

      // 응답 결과 처리
      if (userId != null && userId.isNotEmpty) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: Colors.white,
            title: Text('아이디 찾기 성공'),
            content: Text('회원님의 아이디는 $userId 입니다.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: Text('확인', style: TextStyle(color: Colors.indigo)),
              ),
            ],
          ),
        );
      } else {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: Colors.white,
            title: Text('아이디 찾기 실패'),
            content: Text('입력하신 정보로 회원님을 찾을 수 없습니다.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: Text('확인', style: TextStyle(color: Colors.indigo)),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      print("오류 발생: $e");
    }
  }

  Future<void> resetPassword() async {
    // 요청 전에 입력된 데이터 출력
    print("보내는 데이터: {username: ${idController.text}, phone_number: ${phoneController.text}}");

    // API 호출 후 응답 데이터 출력
    try {
      String? tempPassword = await apiService.resetPassword(
        idController.text,
        phoneController.text,
      );

      // 디버깅 로그 추가
      print("받은 임시 비밀번호: $tempPassword");


      // 응답 결과 처리
      if (tempPassword != null && tempPassword.isNotEmpty) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: Colors.white,
            title: Text('비밀번호 재설정 성공'),
            content: Text('임시 비밀번호는 $tempPassword 입니다. 비밀번호를 변경해 주세요.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: Text('확인', style: TextStyle(color: Colors.indigo)),
              ),
            ],
          ),
        );
      } else {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: Colors.white,
            title: Text('비밀번호 재설정 실패'),
            content: Text('입력하신 정보가 일치하지 않습니다. 다시 시도해 주세요.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                child: Text('확인', style: TextStyle(color: Colors.indigo)),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      print("오류 발생: $e");
    }
  }



  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: Colors.black,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 60, // 컨테이너 높이
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(30), // 둥근 테두리
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          isIdSelected = true;
                        });
                      },
                      child: Container(
                        alignment: Alignment.center, // 버튼 텍스트를 정확히 가운데 정렬
                        decoration: BoxDecoration(
                          color: isIdSelected ? Colors.white : Colors.grey[100],
                          borderRadius: BorderRadius.circular(30),
                          border: isIdSelected
                              ? Border.all(color: Color(0xFF0F148D), width: 1)
                              : null,
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 10), // 동일한 패딩 추가
                          child: Text(
                            '아이디 찾기',
                            style: TextStyle(
                              color: isIdSelected ? Color(0xFF0F148D) : Colors.black,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          isIdSelected = false;
                        });
                      },
                      child: Container(
                        alignment: Alignment.center, // 버튼 텍스트를 정확히 가운데 정렬
                        decoration: BoxDecoration(
                          color: !isIdSelected ? Colors.white : Colors.grey[100],
                          borderRadius: BorderRadius.circular(30),
                          border: !isIdSelected
                              ? Border.all(color: Color(0xFF0F148D), width: 1)
                              : null,
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 10), // 동일한 패딩 추가
                          child: Text(
                            '비밀번호 재설정',
                            style: TextStyle(
                              color: !isIdSelected ? Color(0xFF0F148D) : Colors.black,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 20),
            if (isIdSelected) ...[
              // 아이디 찾기 선택 시 나타나는 필드
              TextFormField(
                controller: nameController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: '이름', // labelText로 제목 추가
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '이름을 입력하세요'; // 유효성 검사 메시지
                  }
                  return null;
                },
              ),
              SizedBox(height: 20),
              TextFormField(
                controller: phoneController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: '휴대전화번호', // labelText로 제목 추가
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '휴대전화번호를 입력하세요';
                  }
                  return null;
                },
              ),
              SizedBox(height: 20),
              Spacer(),
              ElevatedButton(
                onPressed: () {
                  // 아이디 찾기 로직 실행
                  findId();
                },
                child: Text(
                  '아이디 찾기',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 50),
                  backgroundColor: Color(0xFF0F148D),
                ),
              ),
            ] else ...[
              // 비밀번호 찾기 선택 시 나타나는 필드
              TextFormField(
                controller: idController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: '아이디', // labelText로 제목 추가
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '아이디를 입력하세요';
                  }
                  return null;
                },
              ),
              SizedBox(height: 20),
              TextFormField(
                controller: phoneController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: '휴대전화번호', // labelText로 제목 추가
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return '휴대전화번호를 입력하세요';
                  }
                  return null;
                },
              ),
              SizedBox(height: 20),
              Spacer(),
              ElevatedButton(
                onPressed: () {
                  // 비밀번호 재설정 로직 실행
                  resetPassword();
                },
                child: Text(
                  '비밀번호 재설정',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 50),
                  backgroundColor: Color(0xFF0F148D),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
