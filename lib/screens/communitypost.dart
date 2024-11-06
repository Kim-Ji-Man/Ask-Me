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
        _image = File(pickedFile.path);
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

    // userId 확인
    print("Decoded User ID from token: ${payload['userId']}");
    return payload['userId'].toString();
  }

  // 서버 통해 닉네임 불러오기
  Future<String?> getUserNicknameFromServer(String userId) async {
    final response = await http.get(Uri.parse('$BaseUrl/mypage/info/$userId'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['nick'];
    } else {
      print("Failed to fetch nickname from server.");
      return null;
    }
  }


  // 게시글을 서버에 저장하는 함수
  Future<void> createPost(String title, String content) async {
    final userId = await getUserIdFromToken();
    final nick = userId != null ? await getUserNicknameFromServer(userId) : null;

    if (userId == null || nick == null) {
      print("User ID or Nickname is null. Cannot create post.");
      return;
    }

    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    print("Creating post with data: {user_id: $userId, nick: $nick, title: $title, content: $content}");

    final response = await http.post(
      Uri.parse('$BaseUrl/community/posts'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({
        'user_id': userId,
        'nick': nick, // 닉네임 포함
        'title': title,
        'content': content,
        'image': _image != null ? base64Encode(_image!.readAsBytesSync()) : null,
      }),
    );

    if (response.statusCode == 201) {
      Navigator.pop(context);
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
              keyboardType: TextInputType.text,
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
                IconButton(
                  onPressed: _pickImageFromCamera,
                  icon: Icon(Icons.photo_camera),
                  color: Colors.black,
                  iconSize: 30,
                ),
                SizedBox(width: 10),
                IconButton(
                  onPressed: _pickImage,
                  icon: Icon(Icons.photo),
                  color: Colors.black,
                  iconSize: 30,
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
