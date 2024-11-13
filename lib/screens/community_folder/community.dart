import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'communitypost.dart';
import 'postdetail.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decode/jwt_decode.dart';
import 'package:flutter_askme/models/post.dart';


class Community extends StatefulWidget {
  const Community({super.key});

  @override
  State<Community> createState() => _CommunityState();
}

class _CommunityState extends State<Community> {
  List<Post> posts = [];
  String BaseUrl = dotenv.get("BASE_URL");

  @override
  void initState() {
    super.initState();
    fetchPosts(); // 앱 시작 시 게시글 가져오기
  }

  // 토큰을 가져오는 함수
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    print("Retrieved token: $token");
    return token;
  }

  // jwt_decode 패키지를 사용하여 토큰에서 userId 추출
  Future<int?> getUserIdFromToken() async {
    final token = await getToken();
    if (token == null) return null;

    try {
      Map<String, dynamic> payload = Jwt.parseJwt(token);
      print("Decoded token payload: $payload"); // 페이로드 전체 출력

      final userId = payload['userId'] ?? payload['user_id'];
      print("Extracted userId: $userId");
      return userId;
    } catch (e) {
      print("Error decoding token: $e");
      return null;
    }
  }


  Future<void> fetchPosts() async {
    final token = await getToken();

    // 게시물 목록 가져오기
    final response = await http.get(
      Uri.parse('$BaseUrl/community/posts'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> jsonData = json.decode(response.body);

      print("Fetched posts data: $jsonData");

      setState(() {
        posts = jsonData.map((post) {
          return Post.fromJson(post);
        }).toList();
      });

      // 각 게시물에 대해 좋아요 상태 확인
      for (int i = 0; i < posts.length; i++) {
        await _fetchLikeStatus(posts[i].id, i);
      }
    } else {
      throw Exception('Failed to load posts');
    }
  }

  Future<void> createPost(Post post) async {
    final response = await http.post(
      Uri.parse('$BaseUrl/community/posts'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'user_id': 1, // 적절한 user_id로 수정
        'title': post.title,
        'content': post.content,
        'image': null, // 이미지 처리가 필요한 경우 추가
      }),
    );

    if (response.statusCode == 201) {
      fetchPosts(); // 새 게시글 추가 후 목록 갱신
    } else {
      throw Exception('Failed to create post');
    }
  }

  Future<void> toggleLike(String postId, bool isLiked, int index) async {
    final token = await getToken();
    final userId = await getUserIdFromToken();

    if (userId == null || postId == null) {
      print("Error: userId or postId is null.");
      return;
    }

    final url = Uri.parse('$BaseUrl/community/likes');

    final response = isLiked
        ? await http.delete(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({"post_id": int.parse(postId), "user_id": userId}),
    )
        : await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({"post_id": int.parse(postId), "user_id": userId}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      setState(() {
        posts[index].isLiked = !posts[index].isLiked;
        posts[index].likes += posts[index].isLiked ? 1 : -1;
      });
    } else if (response.statusCode == 409) {
      print('Like already exists.');
    } else {
      print('Failed to toggle like with status code: ${response.statusCode}');
      print('Response body: ${response.body}');
    }
  }

  Future<void> _fetchLikeStatus(String postId, int index) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final url = Uri.parse('$BaseUrl/community/likes');

    final response = await http.get(
      url,
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      setState(() {
        posts[index].likes = data['likeCount'];  // 게시물의 좋아요 수
        posts[index].isLiked = data['isLiked'];  // 사용자의 좋아요 여부
      });
    } else {
      print('Failed to fetch like status');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Align(
          alignment: Alignment.centerLeft,
          child: Text(
            '커뮤니티',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 4),
            Expanded(
              child: ListView.builder(
                itemCount: posts.length,
                itemBuilder: (context, index) {
                  return GestureDetector(
                    onTap: () async {
                      final response = await http.get(Uri.parse('$BaseUrl/community/posts/${posts[index].id}'));

                      if (response.statusCode == 200) {
                        final postDetail = Post.fromJson(json.decode(response.body));
                        final result = await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PostDetail(post: postDetail),
                          ),
                        );
                        if (result == true) {
                          fetchPosts(); // 수정 또는 좋아요 상태 변경 후 목록 갱신
                        }
                      } else {
                        throw Exception('Failed to load post detail');
                      }
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            posts[index].title,
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          SizedBox(height: 4),
                          Text(
                            posts[index].content,
                            style: TextStyle(fontSize: 14, color: Colors.black87),
                          ),
                          SizedBox(height: 8),
                          Row(
                            children: [
                              Text(
                                posts[index].location,
                                style: TextStyle(color: Colors.grey[600], fontSize: 12),
                              ),
                              SizedBox(width: 10),
                              Text(
                                posts[index].time,
                                style: TextStyle(color: Colors.grey[600], fontSize: 12),
                              ),
                            ],
                          ),
                          SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  IconButton(
                                    icon: Icon(
                                      posts[index].isLiked ? Icons.favorite : Icons.favorite_border,
                                      color: posts[index].isLiked ? Colors.red : Colors.grey,
                                      size: 18,
                                    ),
                                    onPressed: () {
                                      toggleLike(posts[index].id, posts[index].isLiked, index);
                                    },
                                  ),
                                  SizedBox(width: 4),
                                  Text(
                                    posts[index].likes.toString(),
                                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                              SizedBox(width: 20),
                              Row(
                                children: [
                                  Icon(Icons.chat_bubble_outline, size: 14, color: Colors.grey[600]),
                                  SizedBox(width: 4),
                                  Text(
                                    posts[index].comments.toString(),
                                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                              SizedBox(width: 20),
                              Row(
                                children: [
                                  Icon(Icons.remove_red_eye_outlined, size: 14, color: Colors.grey[600]),
                                  SizedBox(width: 4),
                                  Text(
                                    posts[index].views.toString(),
                                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Divider(),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => CommunityPost()),
          );
        },
        child: Icon(Icons.edit, size: 24),
        backgroundColor: Colors.blue[600],
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(50),
        ),
      ),
    );
  }
}
