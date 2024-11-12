import 'package:flutter/material.dart';
import 'package:flutter_askme/models/signup_data.dart';
import 'package:provider/provider.dart';
import '../../service/api_service.dart';

class SignUpStep3 extends StatefulWidget {
  @override
  _SignUpStep3State createState() => _SignUpStep3State();
}

class _SignUpStep3State extends State<SignUpStep3> {
  final ApiService _apiService = ApiService(); // ApiService 인스턴스 생성
  TextEditingController _nameController = TextEditingController();
  TextEditingController _phoneNumberController =
      TextEditingController(); // 전화번호 컨트롤러 추가
  TextEditingController _birthdateController = TextEditingController();
  TextEditingController _genderController =
      TextEditingController(); // 성별 컨트롤러 추가
  String? _selectedGender;
  String? _birthdateError;
  String? _phoneNumberError; // 전화번호 유효성 검사 에러 메시지

  // 성별 선택 Dialog
  void _showGenderSelectionDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("성별 선택"),
          backgroundColor: Colors.white,
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: Text("남성"),
                onTap: () {
                  setState(() {
                    _selectedGender = "남성";
                    _genderController.text = "남성"; // 선택된 성별을 입력 필드에 나타내기
                  });
                  Navigator.pop(context);
                },
              ),
              ListTile(
                title: Text("여성"),
                onTap: () {
                  setState(() {
                    _selectedGender = "여성";
                    _genderController.text = "여성"; // 선택된 성별을 입력 필드에 나타내기
                  });
                  Navigator.pop(context);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  // 생년월일 형식 검사
  bool _validateBirthdate(String birthdate) {
    final RegExp dateRegExp = RegExp(r'^\d{4}-\d{2}-\d{2}$');
    if (!dateRegExp.hasMatch(birthdate)) {
      return false;
    }
    try {
      final date = DateTime.parse(birthdate);
      return date.year >= 1900 && date.year <= DateTime.now().year;
    } catch (e) {
      return false;
    }
  }

  // 전화번호 형식 검사
  bool _validatePhoneNumber(String phoneNumber) {
    final RegExp phoneRegExp = RegExp(r'^\d{3}-\d{3,4}-\d{4}$');
    return phoneRegExp.hasMatch(phoneNumber);
  }

  // 생년월일 변환 함수 추가 (YYYY-MM-DD -> YYMMDD)
  String _formatBirthdate(String birthdate) {
    return birthdate.replaceAll('-', '').substring(2);
  }

  Future<void> _handleSignUp() async {
    if (!_validateBirthdate(_birthdateController.text)) {
      setState(() {
        _birthdateError = '생년월일을 YYYY-MM-DD 형식으로 입력해주세요.';
      });
      return;
    }

    if (!_validatePhoneNumber(_phoneNumberController.text)) {
      setState(() {
        _phoneNumberError = '전화번호를 010-1234-5678 형식으로 입력해주세요.';
      });
      return;
    }

    // 성별 값 변환
    String gender = _selectedGender == '남성' ? 'man' : 'woman';

    // 생년월일 변환 (YYYY-MM-DD -> YYMMDD)
    String formattedBirthdate = _formatBirthdate(_birthdateController.text);

    // SignUpData에 데이터 저장
    final signUpData = Provider.of<SignUpData>(context, listen: false);
    signUpData.setStep3(
      _nameController.text,
      gender,
      formattedBirthdate,
    );

    // 디버깅 메시지 추가 - API 호출 전에 값 출력
    print('Debug - Store ID before sending: ${signUpData.storeId}');
    print('Debug - Nick before sending: ${signUpData.nick}');
    print('Debug - Email before sending: ${signUpData.email}');
    print('Debug - Username before sending: ${signUpData.username}');
    print('Debug - Role before sending: ${signUpData.role}');

    // SignUpData에서 데이터 가져오기
    final response = await _apiService.signUp(
      storeId: signUpData.storeId,
      // int? 타입을 String? 타입으로 변환
      nick: signUpData.nick!,
      // nickname -> nick으로 변경
      email: signUpData.email!,
      username: signUpData.username!,
      password: signUpData.password!,
      phoneNumber: _phoneNumberController.text,
      name: _nameController.text,
      gender: gender,
      birth: formattedBirthdate,
      role: signUpData.role == 'guard' ? 'guard' : 'user',
    );
    // 호출 후 응답 디버깅 메시지
    print('Debug - Response after API call: $response');

    if (response != null) {
      print("회원가입 성공: $response");
    } else {
      print("회원가입 실패");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text(
          "회원가입",
          style: TextStyle(
            color: Colors.black,
          ),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // 이름 입력 필드
            TextField(
              controller: _nameController,
              decoration: InputDecoration(labelText: '이름'),
            ),
            SizedBox(height: 16),

            // 전화번호 입력 필드
            TextField(
              controller: _phoneNumberController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: '전화번호',
                hintText: '010-1234-5678',
                hintStyle: TextStyle(color: Colors.grey[400]),
                errorText: _phoneNumberError, // 전화번호 에러 메시지
              ),
            ),
            SizedBox(height: 16),

            // 성별 선택 필드
            GestureDetector(
              onTap: _showGenderSelectionDialog,
              child: AbsorbPointer(
                child: TextField(
                  controller: _genderController, // 성별 컨트롤러 연결
                  decoration: InputDecoration(
                    labelText: '성별',
                    hintText: _selectedGender ?? '성별을 선택해주세요',
                    suffixIcon: Icon(Icons.arrow_drop_down),
                  ),
                ),
              ),
            ),
            SizedBox(height: 16),

            // 생년월일 텍스트 필드
            TextField(
              controller: _birthdateController,
              keyboardType: TextInputType.datetime,
              decoration: InputDecoration(
                labelText: '생년월일',
                hintText: 'YYYY-MM-DD',
                hintStyle: TextStyle(color: Colors.grey[400]),
                errorText: _birthdateError, // 생년월일 에러 메시지
              ),
            ),
            Spacer(),
            Container(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF0F148D),
                ),
                onPressed: _handleSignUp, // 완료 버튼 누를 때 API 호출
                child: Text(
                  "완료",
                  style: TextStyle(fontSize: 18, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
