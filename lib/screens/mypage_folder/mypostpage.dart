import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:jwt_decode/jwt_decode.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_askme/screens/community_folder/postdetail.dart';
import 'package:flutter_askme/models/post.dart';

class MyPostPage extends StatefulWidget {
  @override
  _MyPostPageState createState() => _MyPostPageState();
}

class _MyPostPageState extends State<MyPostPage> {
  String? currentUserId;
  List<Post> myPosts = [];
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

  // 토큰에서 userId를 가져와 currentUserId에 저장하고, 게시글을 가져오는 함수
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
      fetchPostsByUserId(currentUserId!);
    }
  }

  // 서버에 userId를 보내 해당 userId의 게시글 목록을 가져오는 함수
  Future<void> fetchPostsByUserId(String userId) async {
    final url = Uri.parse('$BaseUrl/mypage/posts/$userId');
    final response = await http.get(url);
    print("Fetching posts for user ID: $userId");

    if (response.statusCode == 200) {
      final List<dynamic> jsonResponse = json.decode(response.body);
      print("JSON Response: $jsonResponse"); // 전체 JSON 응답 출력

      setState(() {
        myPosts = jsonResponse.map((data) => Post.fromJson(data)).toList();
      });
    } else {
      print("Failed to load posts. Status code: ${response.statusCode}");
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
        title: Text("내가 작성한 글"),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: currentUserId == null || myPosts.isEmpty
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
        itemCount: myPosts.length,
        itemBuilder: (context, index) {
          final post = myPosts[index];

          // post의 id 값을 확인하는 print문 추가
          print("Post ID before navigating to PostDetail: ${post.id}");

          return Column(
            children: [
              ListTile(
                title: Text(post.title),
                subtitle: Text(post.content),
                onTap: () async {
                  // `PostDetail`로 이동할 때에도 `currentUserId`를 유지하도록 `SharedPreferences`에서 불러오기
                  final prefs = await SharedPreferences.getInstance();
                  currentUserId = prefs.getString('userId');
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => PostDetail(
                        post: post,
                        currentUserId: currentUserId,
                      ),
                    ),
                  );
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
