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
import 'dart:async';

class Community extends StatefulWidget {
  const Community({super.key});

  @override
  State<Community> createState() => _CommunityState();
}

class _CommunityState extends State<Community> {
  final PageController _pageController = PageController(initialPage: 1);
  final int _totalPages = 5;
  List<Post> posts = [];
  String BaseUrl = dotenv.get("BASE_URL");
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    fetchPosts();
    _startAutoPageView();
  }

  @override
  void dispose() {
    _timer.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoPageView() {
    _timer = Timer.periodic(Duration(seconds: 3), (timer) {
      int nextPage = _pageController.page!.toInt() + 1;
      if (nextPage > _totalPages) {
        nextPage = 1;
      }
      _pageController.animateToPage(
        nextPage,
        duration: Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    });
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    print("Retrieved token: $token");
    return token;
  }

  Future<int?> getUserIdFromToken() async {
    final token = await getToken();
    if (token == null) return null;

    try {
      Map<String, dynamic> payload = Jwt.parseJwt(token);
      print("Decoded token payload: $payload");

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

      for (int i = 0; i < posts.length; i++) {
        await _fetchLikeStatus(posts[i].id, i);
      }
    } else {
      throw Exception('Failed to load posts');
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
        posts[index].likes = data['likeCount'];
        posts[index].isLiked = data['isLiked'];
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
        backgroundColor: Colors.white,
        elevation: 0,
        automaticallyImplyLeading: false, // 뒤로가기 화살표 제거
        title: Align(
          alignment: Alignment.centerLeft, // 왼쪽 정렬
          child: Text(
            '커뮤니티',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black),
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0), // 좌우 20px, 상하 24px 여백 설정
        child: Column(
          children: [
            SizedBox(
              height: MediaQuery.of(context).size.height * 0.25,
              child: PageView.builder(
                controller: _pageController,
                itemCount: _totalPages + 2,
                itemBuilder: (context, index) {
                  if (index == 0) return buildCard(context, _totalPages - 1);
                  if (index == _totalPages + 1) return buildCard(context, 0);
                  return buildCard(context, index - 1);
                },
              ),
            ),
            SizedBox(height: 16),
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
                          fetchPosts();
                        }
                      } else {
                        throw Exception('Failed to load post detail');
                      }
                    },
                    child: Card(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(0), // 직각 모양 설정
                      ),
                      margin: EdgeInsets.symmetric(vertical: 8),
                      elevation: 0, // 쉐도우 제거
                      color: Colors.blue[50],
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[200],
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    posts[index].nick,
                                    style: TextStyle(fontSize: 12, color: Colors.black54),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 8),
                            Text(
                              posts[index].title,
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(height: 4),
                            Text(
                              posts[index].content,
                              style: TextStyle(fontSize: 14, color: Colors.black87),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '${posts[index].time} · 조회 ${posts[index].views}',
                                  style: TextStyle(fontSize: 12, color: Colors.grey),
                                ),
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
                                    Text(
                                      posts[index].likes.toString(),
                                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                    ),
                                    SizedBox(width: 8),
                                    Icon(Icons.chat_bubble_outline, size: 14, color: Colors.grey[600]),
                                    SizedBox(width: 4),
                                    Text(
                                      posts[index].comments.toString(),
                                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
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
        child: Icon(Icons.edit, size: 24, color: Colors.white),
        backgroundColor: Colors.indigo[600],
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(50),
        ),
      ),
    );
  }
}

Widget buildCard(BuildContext context, int index) {
  List<String> imagePaths = [
    'images/card1.png',
    'images/card2.png',
    'images/card3.png',
    'images/card4.png',
    'images/card5.png',
  ];

  return Card(
    color: Colors.white,
    elevation: 4,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
    child: SizedBox(
      width: double.infinity,
      height: 200,
      child: Image.asset(
        imagePaths[index],
        fit: BoxFit.cover,
      ),
    ),
  );
}
