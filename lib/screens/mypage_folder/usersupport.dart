import 'package:flutter/material.dart';

class UserSupport extends StatefulWidget {
  @override
  _UserSupportState createState() => _UserSupportState();
}

class _UserSupportState extends State<UserSupport> {
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();
  bool isButtonPressed = false;

  Future<void> _submitSupportRequest() async {
    setState(() {
      isButtonPressed = true;
    });

    // 1. 팝업 표시
    await showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          title: Text('메시지 발송 성공!',
            textAlign: TextAlign.center,),
          content: Text('최대한 신속하게 도와드릴게요.',
            textAlign: TextAlign.center,),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // 팝업창 닫기
                _saveToDatabase(); // DB에 정보 저장
                Navigator.of(context).pushReplacementNamed('/mypage'); // mypage로 이동
              },
              child: Text('확인', style: TextStyle(color: Colors.indigo),),
            ),
          ],
        );
      },
    );

    setState(() {
      isButtonPressed = false;
    });
  }

  Future<void> _saveToDatabase() async {
    // DB에 정보를 저장하는 로직을 추가하세요.
    // 예: await database.save(phoneController.text, descriptionController.text);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        backgroundColor: Colors.white,
      ),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('도움이 필요하신가요?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold,)),
            SizedBox(height: 12),
            Text(
              '어떤 도움이 필요하신지 자세하게 설명해 주세요. 저희 Askme팀이 신속하게 도와드릴게요!',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            SizedBox(height: 20),
            TextField(
              controller: phoneController,
              decoration: InputDecoration(
                labelText: '핸드폰 번호 *',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.phone,
            ),
            SizedBox(height: 20),
            TextField(
              controller: descriptionController,
              decoration: InputDecoration(
                labelText: '설명 *',
                border: OutlineInputBorder(),
              ),
              maxLines: 5,
            ),
            Spacer(),
            ElevatedButton(
              onPressed: _submitSupportRequest,
              style: ElevatedButton.styleFrom(
                backgroundColor: isButtonPressed ? Colors.indigo[400] : Colors.indigo[800], // 버튼 색상 변경
                minimumSize: Size(double.infinity, 50),
              ),
              child: Text('제출하기', style: TextStyle(color: Colors.white),),
            ),
          ],
        ),
      ),
      backgroundColor: Colors.white,
    );
  }
}
