import 'package:flutter/material.dart';

class MyInfoPage extends StatelessWidget {
  final TextEditingController nicknameController = TextEditingController(text: '메롱');
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController emailController = TextEditingController(text: 'merong@gmail.com');
  final TextEditingController phoneController = TextEditingController(text: '010-1234-5678');
  final TextEditingController storeController = TextEditingController(text: '매장명 입력');

  String selectedYear = '1997';
  String selectedMonth = '01';
  String selectedDay = '15';

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
        title: Text('개인정보 관리', style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: ListView(
          children: [
            SizedBox(height: 20),
            _buildInfoRow('아이디', 'merong'),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildInfoRow('이름', '홍길동'),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildEditableField('닉네임', nicknameController),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildBirthdateRow(), // 생년월일 드롭다운 행 추가
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildEditableField('휴대폰 번호', phoneController),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildEditableField('이메일', emailController),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildEditableField('매장명', storeController),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 40),
            ElevatedButton(
              onPressed: () {
                _saveChanges();
              },
              child: Text('수정 완료'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 15),
                backgroundColor: Colors.blue[500],
                foregroundColor: Colors.black,
              ),
            ),
            SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // 기본 정보 표시 행
  Widget _buildInfoRow(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 14, color: Colors.grey)),
        SizedBox(height: 8),
        Text(value, style: TextStyle(fontSize: 16, color: Colors.black)),
      ],
    );
  }

  // 수정 가능한 필드
  Widget _buildEditableField(String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 14, color: Colors.grey)),
        SizedBox(height: 8),
        TextFormField(
          controller: controller,
          textAlign: TextAlign.start,
          decoration: InputDecoration(
            hintText: '입력하세요',
            contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(5.0),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
          ),
        ),
      ],
    );
  }

  // 생년월일 드롭다운 행
  Widget _buildBirthdateRow() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('생년월일', style: TextStyle(fontSize: 14, color: Colors.grey)),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                value: selectedYear,
                items: List.generate(100, (index) {
                  return DropdownMenuItem(
                    value: (1920 + index).toString(),
                    child: Text((1920 + index).toString()),
                  );
                }),
                onChanged: (value) {
                  selectedYear = value!;
                },
                decoration: InputDecoration(
                  contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(5.0),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                ),
              ),
            ),
            SizedBox(width: 10),
            Expanded(
              child: DropdownButtonFormField<String>(
                value: selectedMonth,
                items: List.generate(12, (index) {
                  return DropdownMenuItem(
                    value: (index + 1).toString().padLeft(2, '0'),
                    child: Text((index + 1).toString().padLeft(2, '0')),
                  );
                }),
                onChanged: (value) {
                  selectedMonth = value!;
                },
                decoration: InputDecoration(
                  contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(5.0),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                ),
              ),
            ),
            SizedBox(width: 10),
            Expanded(
              child: DropdownButtonFormField<String>(
                value: selectedDay,
                items: List.generate(31, (index) {
                  return DropdownMenuItem(
                    value: (index + 1).toString().padLeft(2, '0'),
                    child: Text((index + 1).toString().padLeft(2, '0')),
                  );
                }),
                onChanged: (value) {
                  selectedDay = value!;
                },
                decoration: InputDecoration(
                  contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(5.0),
                    borderSide: BorderSide(color: Colors.grey[300]!),
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // 데이터 저장 함수
  void _saveChanges() {
    String nickname = nicknameController.text;
    String password = passwordController.text;
    String email = emailController.text;
    String phone = phoneController.text;
    String store = storeController.text;

    // DB에 저장 로직 추가

    print('닉네임: $nickname');
    print('비밀번호: $password');
    print('이메일: $email');
    print('휴대폰 번호: $phone');
    print('매장명: $store');
  }
}
