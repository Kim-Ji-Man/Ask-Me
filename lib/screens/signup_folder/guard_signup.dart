import 'package:flutter/material.dart';

class GuardSignUp extends StatefulWidget {
  @override
  _GuardSignUpState createState() => _GuardSignUpState();
}

class _GuardSignUpState extends State<GuardSignUp> {
  final TextEditingController _nameController = TextEditingController();
  final FocusNode _nameFocusNode = FocusNode();

  void initState() {
    super.initState();

    // 위젯이 빌드된 후에 자동으로 포커스를 설정
    WidgetsBinding.instance.addPostFrameCallback((_){
      FocusScope.of(context).requestFocus(_nameFocusNode);
    });
  }

    void dispose() {
      _nameController.dispose();
      _nameFocusNode.dispose(); // FocusNode는 사용후 dispose 해줘야 함
      super.dispose();
    }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white, // 앱바 배경색을 흰색으로 설정
        foregroundColor: Colors.black, // 앱바 텍스트 및 아이콘 색상을 검정색으로 설정
        elevation: 0, // 그림자 제거
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.pop(context); // 이전 화면으로 돌아가기
          },
        ),
      ),
      body: Container(
        color: Colors.white, // 전체 배경색을 흰색으로 설정
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '이름을 알려주세요',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 60),
            TextField(
              controller: _nameController,
              focusNode: _nameFocusNode, // Textfield에 FocusNode 연결
              decoration: InputDecoration(
                labelText: '이름',
                enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: Color(0xFF0F148D),width: 2.0),
                ),
                focusedBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: Color(0xFF0F148D),width: 2.0),
                )
              ),
            ),
          ],
        ),
      ),
    );
  }
}
