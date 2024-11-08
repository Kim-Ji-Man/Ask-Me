import 'package:flutter/material.dart';

class FindIdPasswordPage extends StatefulWidget {
  @override
  _FindIdPasswordPageState createState() => _FindIdPasswordPageState();
}

class _FindIdPasswordPageState extends State<FindIdPasswordPage> {
  bool isIdSelected = true; // 아이디 찾기와 비밀번호 찾기 탭 전환용 변수
  TextEditingController nameController = TextEditingController();
  TextEditingController phoneController = TextEditingController();
  TextEditingController idController = TextEditingController(); // 아이디 입력 필드 컨트롤러

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
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
              height: 60, // 컨테이너 높이를 조정하여 탭의 크기를 키움
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(30), // 둥근 테두리
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          isIdSelected = true;
                        });
                      },
                      child: Container(
                        padding: EdgeInsets.symmetric(vertical: 10),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: isIdSelected ? Colors.white : Colors.grey[300],
                          borderRadius: BorderRadius.circular(30),
                          border: isIdSelected
                              ? Border.all(color: Color(0xFF0F148D), width: 1)
                              : null,
                        ),
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
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          isIdSelected = false;
                        });
                      },
                      child: Container(
                        padding: EdgeInsets.symmetric(vertical: 10),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: !isIdSelected ? Colors.white : Colors.grey[300],
                          borderRadius: BorderRadius.circular(30),
                          border: !isIdSelected
                              ? Border.all(color: Color(0xFF0F148D), width: 1)
                              : null,
                        ),
                        child: Text(
                          '비밀번호 재설정',
                          style: TextStyle(
                              color: !isIdSelected ? Color(0xFF0F148D) : Colors.black,
                              fontWeight: FontWeight.bold,
                              fontSize: 16
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
              Text(
                '이름 *',
                style: TextStyle(fontSize: 16),
              ),
              SizedBox(height: 5),
              TextFormField(
                controller: nameController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: '이름을 입력하세요.',
                  hintStyle: TextStyle(color: Colors.grey[400]),
                ),
              ),
              SizedBox(height: 20),
              Text(
                '휴대전화번호 *',
                style: TextStyle(fontSize: 16),
              ),
              SizedBox(height: 5),
              TextFormField(
                controller: phoneController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: '회원가입시 입력한 휴대폰 번호를 입력하세요.',
                  hintStyle: TextStyle(color: Colors.grey[400]),
                ),
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  // 아이디 찾기 로직 추가
                },
                child: Text('아이디 찾기'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF0F148D),
                ),
              ),
            ] else ...[
              // 비밀번호 찾기 선택 시 나타나는 필드
              Text(
                '아이디 *',
                style: TextStyle(fontSize: 16),
              ),
              SizedBox(height: 5),
              TextFormField(
                controller: idController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: '아이디를 입력하세요.',
                  hintStyle: TextStyle(color: Colors.grey[400]),
                ),
              ),
              SizedBox(height: 20),
              Text(
                '휴대전화번호 *',
                style: TextStyle(fontSize: 16),
              ),
              SizedBox(height: 5),
              TextFormField(
                controller: phoneController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: '회원가입시 입력한 휴대폰 번호를 입력하세요.',
                  hintStyle: TextStyle(color: Colors.grey[400]),
                ),
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  // 비밀번호 재설정 로직 추가
                },
                child: Text('비밀번호 재설정'),
                style: ElevatedButton.styleFrom(
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
