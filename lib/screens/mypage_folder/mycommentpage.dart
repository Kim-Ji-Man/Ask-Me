import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:jwt_decode/jwt_decode.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_askme/screens/community_folder/postdetail.dart';
import 'package:flutter_askme/models/post.dart';

class Comment {
  final String content;
  final String time;
  final String postTitle;
  final String postId;

  Comment({
    required this.content,
    required this.time,
    required this.postTitle,
    required this.postId,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      content: json['content'] ?? '내용 없음',
      time: json['created_at'] ?? DateTime.now().toString(),
      postTitle: json['post_title'] ?? '제목 없음',
      postId: json['post_id'].toString(),
    );
  }
}

class MyCommentPage extends StatefulWidget {
  @override
  _MyCommentPageState createState() => _MyCommentPageState();
}

class _MyCommentPageState extends State<MyCommentPage> {
  String? currentUserId;
  List<Comment> myComments = [];
  String BaseUrl = dotenv.get("BASE_URL");

  @override
  void initState() {
    super.initState();
    loadCurrentUserId();
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    print("Retrieved token: $token");
    return token;
  }

  // 토큰에서 userId를 가져와 currentUserId에 저장하고, 댓글을 가져오는 함수
  Future<void> loadCurrentUserId() async {
    final prefs = await SharedPreferences.getInstance();
    String? userId = prefs.getString('userId');

    if (userId == null) {
      // SharedPreferences에 userId가 없으면 토큰에서 추출
      final token = await getToken();
      if (token != null) {
        Map<String, dynamic> payload = Jwt.parseJwt(token);
        userId = (payload['userId'] ?? payload['user_id']).toString();
        await prefs.setString('userId', userId);
      }
    }
    currentUserId = userId;
    print("Current User ID: $currentUserId");
    if (currentUserId != null) {
      fetchCommentsByUserId(currentUserId!);
    }
  }

  // 서버에 userId를 보내 해당 userId의 댓글 목록을 가져오는 함수
  Future<void> fetchCommentsByUserId(String userId) async {
    final url = Uri.parse('$BaseUrl/mypage/comments/$userId');
    final response = await http.get(url);
    print("Fetching comments for user ID: $userId");

    if (response.statusCode == 200) {
      final List<dynamic> jsonResponse = json.decode(response.body);
      print("JSON Response: $jsonResponse"); // 전체 JSON 응답 출력

      setState(() {
        myComments = jsonResponse.map((data) => Comment.fromJson(data)).toList();
      });
    } else {
      print("Failed to load comments. Status code: ${response.statusCode}");
    }
  }

  Future<void> navigateToPostDetail(String postId) async {
    final response = await http.get(Uri.parse('$BaseUrl/community/posts/$postId'));

    if (response.statusCode == 200) {
      final postJson = json.decode(response.body);
      final post = Post.fromJson(postJson);

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PostDetail(
            post: post,
            currentUserId: currentUserId,
          ),
        ),
      );
    } else {
      print("Failed to load post details. Status code: ${response.statusCode}");
    }
  }

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
        title: Text("내가 작성한 댓글"),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: currentUserId == null || myComments.isEmpty
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
        itemCount: myComments.length,
        itemBuilder: (context, index) {
          final comment = myComments[index];

          return Column(
            children: [
              ListTile(
                title: Text(comment.content),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("게시글 제목: ${comment.postTitle}"),
                  ],
                ),
                onTap: () async {
                  await navigateToPostDetail(comment.postId);
                },
              ),
              Divider(),
            ],
          );
        },
      ),
    );
  }
}
