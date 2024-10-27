import 'package:flutter/material.dart';

class SignUpStep3 extends StatefulWidget {
  @override
  _SignUpStep3State createState() => _SignUpStep3State();
}

class _SignUpStep3State extends State<SignUpStep3> {
  TextEditingController _nameController = TextEditingController();
  String? _gender; // 성별을 선택하기 위한 변수
  TextEditingController _birthDateController = TextEditingController();

  // 생년월일 선택
  Future<void> _selectBirthDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      setState(() {
        _birthDateController.text = "${picked.toLocal()}".split(' ')[0];
      });
    }
  }

  // 성별 선택 Bottom Sheet
  void _showGenderSelection() {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Container(
          height: 150,
          child: Column(
            children: [
              ListTile(
                title: Text('남성'),
                onTap: () {
                  setState(() {
                    _gender = '남성';
                  });
                  Navigator.pop(context);
                },
              ),
              ListTile(
                title: Text('여성'),
                onTap: () {
                  setState(() {
                    _gender = '여성';
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // 배경색을 흰색으로 설정
      appBar: AppBar(
        backgroundColor: Colors.white, // 앱바 배경색을 흰색으로 설정
        title: Text(
          "회원가입",
          style: TextStyle(
            color: Colors.black, // 앱바 텍스트 색상을 검정색으로 설정
          ),
        ),
        centerTitle: true,
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
            // 성별 선택 필드
            GestureDetector(
              onTap: _showGenderSelection,
              child: AbsorbPointer(
                child: TextField(
                  decoration: InputDecoration(
                    labelText: '성별',
                    hintText: _gender ?? '성별을 선택해주세요',
                  ),
                ),
              ),
            ),
            SizedBox(height: 16),
            // 생년월일 선택 필드
            GestureDetector(
              onTap: _selectBirthDate,
              child: AbsorbPointer(
                child: TextField(
                  controller: _birthDateController,
                  decoration: InputDecoration(labelText: '생년월일'),
                ),
              ),
            ),
            Spacer(),
            Container(
              width: double.infinity,
              height: 60,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF0F148D), // 버튼 색상
                ),
                onPressed: () {
                  // 제출 로직 추가 가능
                },
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
