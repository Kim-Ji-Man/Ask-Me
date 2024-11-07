import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class PostDeletePage extends StatelessWidget {
  final String postId;

  PostDeletePage({required this.postId});

  Future<void> deletePost(BuildContext context) async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));
    final baseUrl = dotenv.get("BASE_URL");

    final response = await http.delete(
      Uri.parse('$baseUrl/community/posts/$postId'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      Navigator.pop(context, true); // 삭제 완료 후 true 반환
    } else {
      print("Failed to delete post. Status code: ${response.statusCode}");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('게시글 삭제'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('이 게시글을 삭제하시겠습니까?'),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => deletePost(context),
              child: Text('삭제'),
            ),
          ],
        ),
      ),
    );
  }
}
