import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/community.dart';
import 'package:flutter_askme/screens/postdeletepage.dart';
import 'package:flutter_askme/screens/posteditpage.dart';
import 'package:intl/intl.dart';
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:io';




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
  String? currentUserId;
  bool isLiked = false;
  int likeCount = 0;

  @override
  void initState() {
    super.initState();
    isLiked = widget.post.isLiked;
    likeCount = widget.post.likes;
    fetchComments();
    fetchCurrentUserId();
  }

  final List<Comment> comments = [];
  final TextEditingController commentController = TextEditingController();

  get isAuthor => null;

  // 서버에서 댓글 목록 가져오기
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
          String formattedTime = comment['created_at'] != null
              ? DateFormat('yy.MM.dd HH:mm').format(DateTime.parse(comment['created_at']))
              : "시간 없음";
          return Comment(
              comment['content'] ?? "내용 없음",
              formattedTime,
              comment['nick'] ?? "알 수 없는 사용자"
          );
        }).toList());
      });
    } else {
      print("Failed to load comments. Status code: ${response.statusCode}");
    }
  }

  // PostDetail 페이지 내 toggleLike 메서드
  Future<void> toggleLike() async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    if (isLiked) {
      // 좋아요 삭제
      final response = await http.delete(
        Uri.parse('$BaseUrl/community/likes'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({"post_id": widget.post.id}),
      );
      if (response.statusCode == 200) {
        setState(() {
          isLiked = false;
          likeCount--;
        });
      } else {
        print("Failed to remove like. Status code: ${response.statusCode}");
      }
    } else {
      // 좋아요 추가
      final response = await http.post(
        Uri.parse('$BaseUrl/community/likes'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({"post_id": widget.post.id}),
      );
      if (response.statusCode == 201) {
        setState(() {
          isLiked = true;
          likeCount++;
        });
      } else {
        print("Failed to add like. Status code: ${response.statusCode}");
      }
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

  Future<void> fetchCurrentUserId() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token != null) {
      final parts = token.split('.');
      final payload = json.decode(
        utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
      );
      setState(() {
        currentUserId = payload['user_id'].toString();
      });
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

  Future<String?> uploadImage(File imageFile) async {
    final url = Uri.parse('$BaseUrl/community/posts');
    final request = http.MultipartRequest('POST', url);

    request.files.add(
      await http.MultipartFile.fromPath(
        'image',
        imageFile.path,
      ),
    );

    final response = await request.send();

    if (response.statusCode == 200) {
      final responseBody = await http.Response.fromStream(response);
      final data = jsonDecode(responseBody.body);
      return data['imageUrl'];
    } else {
      print('Failed to upload image. Status code: ${response.statusCode}');
      return null;
    }
  }



  @override
  Widget build(BuildContext context) {
    final bool isAuthor = currentUserId == widget.post.id;

    String imageUrl = widget.post.image != null && widget.post.image!.isNotEmpty
        ? '$BaseUrl/${widget.post.image}'
        : 'images/img_logo.png';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (isAuthor)
            PopupMenuButton<String>(
              icon: Icon(Icons.more_vert),
              onSelected: (value) async {
                if (value == 'edit') {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => PostEditPage(
                        postId: widget.post.id,
                        initialTitle: widget.post.title,
                        initialContent: widget.post.content,
                      ),
                    ),
                  );
                  if (result == true) {
                    Navigator.pop(context, true);
                  }
                } else if (value == 'delete') {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => PostDeletePage(postId: widget.post.id),
                    ),
                  );
                  if (result == true) {
                    Navigator.pop(context, true);
                  }
                }
              },
              itemBuilder: (context) => [
                PopupMenuItem(value: 'edit', child: Text('수정')),
                PopupMenuItem(value: 'delete', child: Text('삭제')),
              ],
            ),
        ],
      ),
      body: SingleChildScrollView(
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
            Text(
              widget.post.title,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            Text(widget.post.content),
            SizedBox(height: 30),
            if (widget.post.image != null && widget.post.image!.isNotEmpty)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.network(
                  imageUrl,
                  width: double.infinity,
                  fit: BoxFit.contain,
                ),
              ),
            SizedBox(height: 16),
            Row(
              children: [
                IconButton(
                  icon: Icon(
                    isLiked ? Icons.favorite : Icons.favorite_border,
                    color: isLiked ? Colors.red : Colors.grey,
                  ),
                  onPressed: toggleLike,
                ),
                Text('$likeCount'),
              ],
            ),
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
      bottomNavigationBar: Padding(
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
    );
  }
}
