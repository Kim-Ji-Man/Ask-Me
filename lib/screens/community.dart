import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'communitypost.dart';
import 'postdetail.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
    return prefs.getString('token'); // 저장된 토큰을 가져옴
  }

  Future<void> fetchPosts() async {
    final response = await http.get(Uri.parse('$BaseUrl/community/posts'));

    if (response.statusCode == 200) {
      final List<dynamic> jsonData = json.decode(response.body);

      print("Fetched posts data: $jsonData");

      setState(() {
        posts = jsonData.map((post) {
          return Post.fromJson(post); // Post 클래스의 fromJson 메서드 사용
        }).toList();
      });
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
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PostDetail(post: postDetail),
                          ),
                        ).then((value) {
                          if (value == true) {
                            fetchPosts();  // 수정 후 목록 갱신
                          }
                        });
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
                                      setState(() {
                                        posts[index].isLiked = !posts[index].isLiked;
                                        if (posts[index].isLiked) {
                                          posts[index].likes++;
                                        } else {
                                          posts[index].likes--;
                                        }
                                      });
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

// 글 데이터 클래스
class Post {
  final String id;
  late final String title;
  late final String content;
  final String location;
  final String time;
  final String nick;
  int views;
  int comments;
  int likes;
  bool isLiked;

  Post({
    required this.id,
    required this.title,
    required this.content,
    required this.location,
    required this.time,
    required this.nick,
    required this.views,
    required this.comments,
    required this.likes,
    required this.isLiked,
  });

  // JSON으로부터 Post 객체 생성
  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['post_id'].toString(),
      title: json['title'],
      content: json['content'],
      location: json['location'] ?? '',
      time: Post.formatDate(json['created_at']),
      nick: json['nick'] ?? '알 수 없는 사용자',
      views: json['views'] ?? 0,
      comments: json['comments'] ?? 0,
      likes: json['likes'] ?? 0,
      isLiked: json['is_liked'] ?? false,
    );
  }

  // 날짜 형식 변환 함수
  static String formatDate(String createdAt) {
    final DateTime dateTime = DateTime.parse(createdAt);
    return DateFormat('yyyy-MM-dd HH:mm').format(dateTime);
  }
}
