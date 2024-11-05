import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/community.dart';
import 'package:intl/intl.dart';
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class Comment {
  String content;
  String time;
  String nickname;

  Comment(this.content, this.time, this.nickname);
}

class PostDetail extends StatefulWidget {
  final Post post;

  PostDetail({required this.post});

  @override
  _PostDetailState createState() => _PostDetailState();
}

class _PostDetailState extends State<PostDetail> {
  String BaseUrl = dotenv.get("BASE_URL");

  @override
  void initState() {
    super.initState();
    fetchComments();
  }

  final List<Comment> comments = [];
  final TextEditingController commentController = TextEditingController();
  bool isLiked = false;
  int likeCount = 0;

  // 서버에서 댓글 목록 가져오기 (user_id를 통해 서버에서 nick을 처리)
  Future<void> fetchComments() async {
    final response = await http.get(
      Uri.parse('$BaseUrl/community/posts/${widget.post.id}/comments'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final List<dynamic> jsonData = json.decode(response.body);
      setState(() {
        comments.clear();
        comments.addAll(jsonData.map((comment) {
          // created_at 필드가 있는 경우, 포맷된 시간으로 변환
          String formattedTime;
          if (comment['created_at'] != null) {
            DateTime parsedTime = DateTime.parse(comment['created_at']);
            formattedTime = DateFormat('yy.MM.dd HH:mm').format(parsedTime);
          } else {
            formattedTime = "시간 없음"; // created_at이 null일 경우 기본값 설정
          }

          return Comment(
              comment['content'] ?? "내용 없음",  // 기본값 설정
              formattedTime,                    // 포맷된 시간 사용
              comment['nick'] ?? "알 수 없는 사용자"  // 닉네임 기본값 설정
          );
        }).toList());
      });
    } else {
      print("Failed to load comments. Status code: ${response.statusCode}");
    }
  }


  // 댓글 추가 메서드 (nick 없이 저장)
  Future<void> addComment(String content) async {
    final userId = await getUserIdFromToken();
    if (userId == null) {
      print("User ID is null. Cannot add comment.");
      return;
    }

    final commentData = {
      "post_id": widget.post.id,
      "user_id": userId,
      "content": content,
    };

    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    final response = await http.post(
      Uri.parse('$BaseUrl/community/comments'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(commentData),
    );

    if (response.statusCode == 201) {
      await fetchComments(); // 댓글을 다시 불러옵니다.
      commentController.clear();
    } else {
      print("Failed to add comment. Status code: ${response.statusCode}");
    }
  }

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(icon: Icon(Icons.notifications), onPressed: () {}),
          IconButton(icon: Icon(Icons.share), onPressed: () {}),
          PopupMenuButton<String>(
            icon: Icon(Icons.more_vert),
            onSelected: (value) {
              if (value == 'edit') {
                // 게시글 수정 기능
              } else if (value == 'delete') {
                // 게시글 삭제 기능
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(value: 'edit', child: Text('수정')),
              PopupMenuItem(value: 'delete', child: Text('삭제')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(widget.post.nick, style: TextStyle(fontWeight: FontWeight.bold)),
                          Text(widget.post.time),
                        ],
                      ),
                    ],
                  ),
                  SizedBox(height: 30),
                  Text(widget.post.title, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  SizedBox(height: 20),
                  Text(widget.post.content),
                  SizedBox(height: 30),
                  Divider(
                    thickness: 3.0,
                    color: Colors.grey[300],
                  ),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    reverse: true,
                    itemCount: comments.length,
                    itemBuilder: (context, index) {
                      return ListTile(
                        leading: Text(
                          comments[index].nickname,
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        title: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(comments[index].content),
                            Text(
                              comments[index].time,
                              style: TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: commentController,
                    decoration: InputDecoration(
                      hintText: '댓글을 입력해주세요',
                      hintStyle: TextStyle(color: Colors.grey[400]),
                      filled: true,
                      fillColor: Colors.grey[100],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.send, color: Colors.blue),
                  onPressed: () {
                    if (commentController.text.isNotEmpty) {
                      addComment(commentController.text);
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}