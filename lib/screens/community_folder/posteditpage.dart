import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class PostEditPage extends StatefulWidget {
  final String postId;
  final String initialTitle;
  final String initialContent;

  PostEditPage({
    required this.postId,
    required this.initialTitle,
    required this.initialContent,
  });

  @override
  _PostEditPageState createState() => _PostEditPageState();
}

class _PostEditPageState extends State<PostEditPage> {
  String baseUrl = dotenv.get("BASE_URL");
  final TextEditingController titleController = TextEditingController();
  final TextEditingController contentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    titleController.text = widget.initialTitle;
    contentController.text = widget.initialContent;
  }

  Future<void> updatePost() async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));
    final response = await http.put(
      Uri.parse('$baseUrl/community/posts/${widget.postId}'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({
        'title': titleController.text,
        'content': contentController.text,
      }),
    );

    if (response.statusCode == 200) {
      // 수정된 제목과 내용을 함께 반환
      Navigator.pop(context, {
        'title': titleController.text,
        'content': contentController.text,
        // 만약 이미지도 수정할 수 있다면 여기에 추가
        // 'image': imageUrl
      });
    } else {
      print("Failed to update post. Status code: ${response.statusCode}");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('게시글 수정'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: titleController,
              decoration: InputDecoration(labelText: '제목'),
            ),
            SizedBox(height: 16),
            TextField(
              controller: contentController,
              decoration: InputDecoration(labelText: '내용'),
              maxLines: null,
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: updatePost,
              child: Text('수정 완료'),
            ),
          ],
        ),
      ),
    );
  }
}
