import 'package:flutter/material.dart';
import 'signup_step2.dart'; // 새로 만든 페이지를 임포트합니다.
import 'package:provider/provider.dart'; // Provider 패키지 임포트
import 'package:flutter_askme/models/signup_data.dart';

class SignUpStep1 extends StatefulWidget {
  final bool isGuard;

  SignUpStep1({this.isGuard = true});

  @override
  _SignUpStep1State createState() => _SignUpStep1State();
}

class _SignUpStep1State extends State<SignUpStep1> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _storeNameController = TextEditingController();
  final TextEditingController _nickController = TextEditingController(); // nickname -> nick으로 변경
  final TextEditingController _emailController = TextEditingController();

  // 특수문자를 제한하는 닉네임 유효성 검사 함수
  String? validateNickname(String nick) { // parameter도 nick으로 변경
    final validCharacters = RegExp(r'^[a-zA-Z0-9ㄱ-ㅎ가-힣_]+$');
    if (nick.isEmpty) {
      return '닉네임을 입력해주세요';
    }
    if (nick.length < 2) {
      return '닉네임은 최소 2자 이상이어야 합니다';
    }
    if (nick.length > 15) {
      return '닉네임은 최대 15자까지 입력 가능합니다';
    }
    if (!validCharacters.hasMatch(nick)) {
      return '닉네임은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다';
    }
    return null;
  }

  // 이메일 유효성 검사 함수
  String? validateEmail(String email) {
    // 이메일 형식 검사 (정규 표현식 사용)
    final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

    if (email.isEmpty) {
      return '이메일을 입력해 주세요'; // 빈 값 검사
    }
    if (email.contains(' ')) {
      return '이메일에 공백을 포함할 수 없습니다'; // 공백 문자 제한
    }
    if (!emailRegex.hasMatch(email)) {
      return '유효한 이메일 형식이 아닙니다'; // 형식 검사
    }
    return null;
  }

  void _showStoreSelectionBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      builder: (BuildContext context) {
        return FractionallySizedBox(
          heightFactor: 0.33,
          child: Container(
            padding: EdgeInsets.symmetric(vertical: 12.0, horizontal: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Text(
                    "매장 선택",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                SizedBox(height: 16),
                Divider(),
                ListTile(
                  title: Center(child: Text("더 현대")),
                  onTap: () {
                    setState(() {
                      _storeNameController.text = "더 현대";
                    });
                    Navigator.pop(context);
                  },
                ),
                Divider(),
                ListTile(
                  title: Center(child: Text("신세계 백화점")),
                  onTap: () {
                    setState(() {
                      _storeNameController.text = "신세계 백화점";
                    });
                    Navigator.pop(context);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _onNextButtonPressed() {
    if (_formKey.currentState!.validate()) {
      // Provider를 사용하여 SignUpData에 접근
      final signUpData = Provider.of<SignUpData>(context, listen: false);

      // 입력 데이터를 SignUpData에 저장
      signUpData.setStep1(
        widget.isGuard ? _storeNameController.text : null, // 매장명 저장 (경비원일 경우에만)
        _nickController.text, // 닉네임 저장
        _emailController.text, // 이메일 저장
      );

      // 다음 화면으로 이동
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => SignUpStep2()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
        title: Text("회원가입"),
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 매장명 입력 필드 (경비원인 경우에만 보이게)
              if (widget.isGuard) ...[
                GestureDetector(
                  onTap: _showStoreSelectionBottomSheet,
                  child: AbsorbPointer(
                    child: TextFormField(
                      controller: _storeNameController,
                      decoration: InputDecoration(
                        labelText: '매장명',
                        suffixIcon: Icon(Icons.arrow_drop_down),
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 16),
              ],
              // 닉네임 입력 필드 (특수문자 제한)
              TextFormField(
                controller: _nickController, // controller 이름 변경
                decoration: InputDecoration(labelText: '닉네임'),
                validator: (value) => validateNickname(value ?? ""),
              ),
              SizedBox(height: 16),
              // 이메일 입력 필드 (형식 검사, 빈 값 검사, 공백 문자 제한)
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(labelText: '이메일'),
                validator: (value) => validateEmail(value ?? ""),
              ),
              Spacer(),
              Container(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF0F148D),
                  ),
                  onPressed: _onNextButtonPressed,
                  child: Text(
                    '다음',
                    style: TextStyle(fontSize: 18, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
