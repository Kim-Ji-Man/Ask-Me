import 'package:flutter/material.dart';

class GuardSignUp extends StatefulWidget {
  @override
  _GuardSignUpState createState() => _GuardSignUpState();
}

class _GuardSignUpState extends State<GuardSignUp> {
  final TextEditingController _nameController = TextEditingController();
  final FocusNode _nameFocusNode = FocusNode();

  @override
  void initState() {
    super.initState();

    // 위젯이 빌드된 후에 자동으로 포커스를 설정
    WidgetsBinding.instance.addPostFrameCallback((_) {
      FocusScope.of(context).requestFocus(_nameFocusNode); // guard_signup 페이지에서만 포커스를 설정
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _nameFocusNode.dispose(); // FocusNode는 사용 후 dispose 해줘야 함
    super.dispose();
  }

  void _onConfirm() {
    final name = _nameController.text;
    // 여기에서 이름을 사용하는 로직을 추가할 수 있습니다.
    print('입력한 이름: $name');
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // 이전 페이지로 돌아갈 때 포커스를 해제
        FocusScope.of(context).unfocus();
        return true;
      },
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back),
            onPressed: () {
              Navigator.pop(context); // 이전 화면으로 돌아가기
            },
          ),
        ),
        body: Container(
          color: Colors.white,
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '이름을 알려주세요',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 60),
              Expanded(
                child: Column(
                  children: [
                    TextField(
                      controller: _nameController,
                      focusNode: _nameFocusNode, // TextField에 FocusNode 연결
                      decoration: InputDecoration(
                        labelText: '이름',
                        enabledBorder: UnderlineInputBorder(
                          borderSide: BorderSide(color: Color(0xFF0F148D), width: 2.0), // 색상 설정
                        ),
                        focusedBorder: UnderlineInputBorder(
                          borderSide: BorderSide(color: Color(0xFF0F148D), width: 2.0), // 색상 설정
                        ),
                      ),
                      textInputAction: TextInputAction.done, // 텍스트 입력 작업 완료
                      enableSuggestions: false, // 자동 완성 제안 비활성화
                      keyboardType: TextInputType.text, // 일반 텍스트 키패드 표시
                      onSubmitted: (value) {
                        _onConfirm(); // 확인 버튼 클릭 시 호출
                      },
                    ),
                  ],
                ),
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: _onConfirm, // 확인 버튼 클릭 시 호출
                child: Text('확인'),
              ),
              SizedBox(height: 20), // 여유 공간
            ],
          ),
        ),
      ),
    );
  }
}
