import 'package:flutter/material.dart';
import 'communitypost.dart';
import 'postdetail.dart'; // PostDetail 페이지 import

class Community extends StatefulWidget {
  const Community({super.key});

  @override
  State<Community> createState() => _CommunityState();
}

class _CommunityState extends State<Community> {
  // 예시 데이터
  final List<Post> posts = [
    Post('처음 뵙겠습니다!', '안녕하세요. 오늘 처음 입사해서 느낀 점 간단히 남겨요~', '새내기', '8시간 전', 150, 4, 1, false),
    Post('오늘 하루가 너무 안가네요', '월요일이라 그런지 하루가 너무 안 갑니다.', '퇴근하고싶다', '8시간 전', 72, 0, 4, false),
    Post('3층에 잠수인 왔어요', '듣기로는 잠수인이라던데 참고하세요.', '직장인', '8시간 전', 89, 1, 2, false),
  ];

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
                    onTap: () {
                      // 글 상세 페이지로 이동
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => PostDetail(post: posts[index]),
                        ),
                      );
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
  final String title;
  final String content;
  final String location;
  final String time;
  int views;
  int comments;
  int likes;
  bool isLiked;

  // 생성자에서 모든 필드를 받음
  Post(
      this.title,
      this.content,
      this.location,
      this.time,
      this.views,
      this.comments,
      this.likes,
      this.isLiked,
      );
}
