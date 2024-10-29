import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';


class CommunityPost extends StatefulWidget {
  @override
  _CommunityPostState createState() => _CommunityPostState();
}

class _CommunityPostState extends State<CommunityPost> {
  File? _image; // 사용자가 선택한 이미지를 저장할 변수
  final ImagePicker _picker = ImagePicker(); // 이미지 픽커 인스턴스
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _contentController = TextEditingController();
  String BaseUrl = dotenv.get("BASE_URL");


  // 갤러리에서 이미지 가져오기
  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _image = File(pickedFile.path);
      });
    }
  }

  // 카메라에서 이미지 가져오기
  Future<void> _pickImageFromCamera() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.camera);
    if (pickedFile != null) {
      setState(() {
        _image = File(pickedFile.path); // 선택한 이미지를 리스트에 추가
      });
    }
  }

  // JWT 토큰에서 user_id를 가져오는 함수
  Future<String?> getUserIdFromToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return null;

    final parts = token.split('.');
    if (parts.length != 3) throw Exception('Invalid token');

    final payload = json.decode(
      utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
    );
    return payload['userId'].toString();
  }

  // 게시글을 서버에 저장하는 함수
  Future<void> createPost(String title, String content) async {
    final userId = await getUserIdFromToken();
    if (userId == null) {
      // 사용자 ID를 가져오지 못하면 오류 처리
      return;
    }

    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    final response = await http.post(
      Uri.parse('$BaseUrl/community/posts'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token', // JWT 토큰을 헤더에 추가
      },
      body: json.encode({
        'user_id': userId,
        'title': title,
        'content': content,
        'image': _image != null ? base64Encode(_image!.readAsBytesSync()) : null, // 이미지 base64로 인코딩
      }),
    );

    if (response.statusCode == 201) {
      Navigator.pop(context); // 성공 시 이전 화면으로 돌아가기
    } else {
      throw Exception('Failed to create post');
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text(
          '글쓰기',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.close),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        actions: [
          TextButton(
            onPressed: () {
              createPost(_titleController.text, _contentController.text);
            },
            child: Text(
              '완료',
              style: TextStyle(
                color: Colors.black,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _titleController,
              decoration: InputDecoration(
                hintText: '제목을 입력하세요',
                border: InputBorder.none,
              ),
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              keyboardType: TextInputType.text, // 키보드가 자동으로 뜨게 함
            ),
            Expanded(
              child: TextField(
                controller: _contentController,
                decoration: InputDecoration(
                  hintText: '내용을 입력하세요',
                  border: InputBorder.none,
                ),
                maxLines: null,
                style: TextStyle(fontSize: 16),
                keyboardType: TextInputType.multiline,
              ),
            ),
            Divider(),
            SizedBox(height: 10),
            if (_image != null)
              Image.file(
                _image!,
                width: 100,
                height: 100,
                fit: BoxFit.cover,
              ),
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: _pickImage,
                  icon: Icon(Icons.photo),
                  label: Text('갤러리'),
                ),
                SizedBox(width: 10),
                ElevatedButton.icon(
                  onPressed: _pickImageFromCamera,
                  icon: Icon(Icons.camera),
                  label: Text('카메라'),
                ),
              ],
            ),
            SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}