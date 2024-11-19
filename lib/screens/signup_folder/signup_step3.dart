import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_askme/models/signup_data.dart';
import 'package:provider/provider.dart';
import '../../service/api_service.dart';
import '../login.dart';

class SignUpStep3 extends StatefulWidget {
  @override
  _SignUpStep3State createState() => _SignUpStep3State();
}

class _SignUpStep3State extends State<SignUpStep3> {
  final ApiService _apiService = ApiService();
  TextEditingController _nameController = TextEditingController();
  TextEditingController _phoneNumberController = TextEditingController();
  TextEditingController _birthdateController = TextEditingController();
  TextEditingController _genderController = TextEditingController();
  String? _selectedGender;
  String? _birthdateError;
  String? _phoneNumberError;

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
                    _genderController.text = "남성";
                  });
                  Navigator.pop(context);
                },
              ),
              ListTile(
                title: Text("여성"),
                onTap: () {
                  setState(() {
                    _selectedGender = "여성";
                    _genderController.text = "여성";
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

  bool _validateBirthdate(String birthdate) {
    final RegExp dateRegExp = RegExp(r'^\d{6}$'); // Matches 6 digits
    return dateRegExp.hasMatch(birthdate);
  }

  bool _validatePhoneNumber(String phoneNumber) {
    final RegExp phoneRegExp = RegExp(r'^\d{3}-\d{3,4}-\d{4}$');
    return phoneRegExp.hasMatch(phoneNumber);
  }

  String _formatPhoneNumber(String phoneNumber) {
    phoneNumber = phoneNumber.replaceAll(RegExp(r'\D'), '');
    if (phoneNumber.length > 10) {
      return '${phoneNumber.substring(0, 3)}-${phoneNumber.substring(3, 7)}-${phoneNumber.substring(7, 11)}';
    } else if (phoneNumber.length > 6) {
      return '${phoneNumber.substring(0, 3)}-${phoneNumber.substring(3, 6)}-${phoneNumber.substring(6)}';
    } else if (phoneNumber.length > 3) {
      return '${phoneNumber.substring(0, 3)}-${phoneNumber.substring(3)}';
    } else {
      return phoneNumber;
    }
  }

  Future<void> _handleSignUp() async {
    if (!_validateBirthdate(_birthdateController.text)) {
      setState(() {
        _birthdateError = '생년월일을 YYMMDD 형식으로 입력해주세요.';
      });
      return;
    }

    if (!_validatePhoneNumber(_phoneNumberController.text)) {
      setState(() {
        _phoneNumberError = '전화번호를 010-1234-5678 형식으로 입력해주세요.';
      });
      return;
    }

    String gender = _selectedGender == '남성' ? 'man' : 'woman';
    final signUpData = Provider.of<SignUpData>(context, listen: false);
    signUpData.setStep3(
      _nameController.text,
      gender,
      _birthdateController.text,
    );

    final response = await _apiService.signUp(
      storeId: signUpData.storeId,
      nick: signUpData.nick!,
      email: signUpData.email!,
      username: signUpData.username!,
      password: signUpData.password!,
      phoneNumber: _phoneNumberController.text,
      name: _nameController.text,
      gender: gender,
      birth: _birthdateController.text,
      role: signUpData.role == 'guard' ? 'guard' : 'user',
    );

    // 회원가입 성공 후 로그인 페이지로 이동
    if (response != null) {
      print("회원가입 성공: $response");

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => Login()), // Login 페이지로 직접 지정
      );
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
          icon: Icon(Icons.arrow_back_ios_new, color: Colors.black),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _nameController,
              decoration: InputDecoration(labelText: '이름'),
            ),
            SizedBox(height: 16),
            TextField(
              controller: _phoneNumberController,
              keyboardType: TextInputType.phone,
              onChanged: (value) {
                String formattedPhoneNumber = _formatPhoneNumber(value);
                _phoneNumberController.value = TextEditingValue(
                  text: formattedPhoneNumber,
                  selection: TextSelection.collapsed(
                      offset: formattedPhoneNumber.length),
                );
              },
              decoration: InputDecoration(
                labelText: '전화번호',
                hintText: '010-1234-5678',
                hintStyle: TextStyle(color: Colors.grey[400]),
                errorText: _phoneNumberError,
              ),
            ),
            SizedBox(height: 16),
            GestureDetector(
              onTap: _showGenderSelectionDialog,
              child: AbsorbPointer(
                child: TextField(
                  controller: _genderController,
                  decoration: InputDecoration(
                    labelText: '성별',
                    hintText: _selectedGender ?? '성별을 선택해주세요',
                    suffixIcon: Icon(Icons.arrow_drop_down),
                  ),
                ),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              controller: _birthdateController,
              keyboardType: TextInputType.number,
              inputFormatters: [
                LengthLimitingTextInputFormatter(6),
              ],
              decoration: InputDecoration(
                labelText: '생년월일',
                hintText: 'YYMMDD',
                hintStyle: TextStyle(color: Colors.grey[400]),
                errorText: _birthdateError,
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
                onPressed: _handleSignUp,
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
