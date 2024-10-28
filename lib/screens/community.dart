import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'communitypost.dart';
import 'postdetail.dart'; // PostDetail 페이지 import
import 'package:flutter_dotenv/flutter_dotenv.dart';

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

  Future<void> fetchPosts() async {
    final response = await http.get(Uri.parse('$BaseUrl/community/posts'));

    if (response.statusCode == 200) {
      final List<dynamic> jsonData = json.decode(response.body);
      setState(() {
        posts = jsonData.map((post) {
          return Post(
            id: post['post_id'].toString(), // ID 추가
            title: post['title'],
            content: post['content'],
            location: post['location'] ?? '', // location이 null일 경우 빈 문자열로 설정
            time: formatDate(post['created_at']), // 날짜 형식 변환
            views: post['views'] ?? 0, // 서버에서 조회수 초기값 설정
            comments: post['comments'] ?? 0, // 서버에서 댓글 수 초기값 설정
            likes: post['likes'] ?? 0, // 서버에서 좋아요 수 초기값 설정
            isLiked: post['is_liked'] ?? false, // 서버에서 좋아요 상태 초기값 설정
          );
        }).toList();
      });
    } else {
      throw Exception('Failed to load posts');
    }
  }

  // 날짜 형식 변환 함수
  String formatDate(String createdAt) {
    final DateTime dateTime = DateTime.parse(createdAt);
    return '${dateTime.year}-${dateTime.month}-${dateTime.day} ${dateTime.hour}:${dateTime.minute}';
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
        backgroundColor: Colors.white, // AppBar 배경색 설정
        elevation: 0, // 그림자 제거
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
                      // 글 상세 페이지로 이동하기 전에 조회수를 증가시키는 API 호출
                      final response = await http.get(Uri.parse('$BaseUrl/community/posts/${posts[index].id}')); // id는 Post 클래스에 추가해야 함

                      if (response.statusCode == 200) {
                        // 조회 성공 후 상세 페이지로 이동
                        final postDetail = Post.fromJson(json.decode(response.body)); // Post 클래스에 fromJson 메서드 추가 필요
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PostDetail(post: postDetail),
                          ),
                        );
                      } else {
                        // 오류 처리
                        throw Exception('Failed to load post detail');
                      }
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // 제목
                          Text(
                            posts[index].title,
                            style: TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          SizedBox(height: 4),
                          // 내용
                          Text(
                            posts[index].content,
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.black87,
                            ),
                          ),
                          SizedBox(height: 8),
                          // 작성자와 시간
                          Row(
                            children: [
                              Text(
                                posts[index].location,
                                style: TextStyle(
                                    color: Colors.grey[600], fontSize: 12),
                              ),
                              SizedBox(width: 10),
                              Text(
                                posts[index].time,
                                style: TextStyle(
                                    color: Colors.grey[600], fontSize: 12),
                              ),
                            ],
                          ),
                          SizedBox(height: 8),
                          // 추천, 댓글, 조회수
                          Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              // 공감(하트) 버튼과 공감 수
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
                                  SizedBox(width: 4), // 하트와 숫자 사이 간격
                                  Text(
                                    posts[index].likes.toString(),
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(width: 20), // 추천과 댓글 버튼 간격

                              // 댓글 아이콘과 댓글 수
                              Row(
                                children: [
                                  Icon(Icons.chat_bubble_outline, size: 14, color: Colors.grey[600]),
                                  SizedBox(width: 4), // 아이콘과 숫자 사이 간격
                                  Text(
                                    posts[index].comments.toString(),
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(width: 20), // 댓글과 조회수 버튼 간격

                              // 조회수 아이콘과 조회수
                              Row(
                                children: [
                                  Icon(Icons.remove_red_eye_outlined, size: 14, color: Colors.grey[600]),
                                  SizedBox(width: 4), // 아이콘과 숫자 사이 간격
                                  Text(
                                    posts[index].views.toString(),
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Divider(), // 각 게시물 사이에 구분선
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
          // 글쓰기 페이지로 이동
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => CommunityPost()),
          );
        },
        child: Icon(
          Icons.edit,
          size: 24,
        ), // 글쓰기 아이콘
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
  final String id; // ID 추가
  final String title;
  final String content;
  final String location;
  final String time;
  int views;
  int comments;
  int likes;
  bool isLiked;

  // 생성자에서 모든 필드를 받음
  Post({
    required this.id,
    required this.title,
    required this.content,
    required this.location,
    required this.time,
    required this.views,
    required this.comments,
    required this.likes,
    required this.isLiked,
  });

  // JSON으로부터 Post 객체 생성
  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      id: json['post_id'].toString(), // ID 설정
      title: json['title'],
      content: json['content'],
      location: json['location'] ?? '',
      time: formatDate(json['created_at']),
      views: json['views'] ?? 0,
      comments: json['comments'] ?? 0,
      likes: json['likes'] ?? 0,
      isLiked: json['is_liked'] ?? false, // 좋아요 상태가 있을 경우
    );
  }

  // 날짜 형식 변환 함수
  static String formatDate(String createdAt) {
    final DateTime dateTime = DateTime.parse(createdAt);
    return '${dateTime.year}-${dateTime.month}-${dateTime.day} ${dateTime.hour}:${dateTime.minute}';
  }
}