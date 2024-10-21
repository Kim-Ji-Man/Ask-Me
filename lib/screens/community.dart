import 'package:flutter/material.dart';
import 'communitypost.dart';
import 'postdetail.dart';

class Community extends StatefulWidget {
  const Community({super.key});

  @override
  State<Community> createState() => _CommunityState();
}

class _CommunityState extends State<Community> {
  // 예시 데이터
  final List<Post> posts = [
    Post('제목 1', '내용 1 일부입니다...', '서울', '1시간 전', 120, 3),
    Post('제목 2', '내용 2 일부입니다...', '부산', '2시간 전', 150, 5),
    Post('제목 3', '내용 3 일부입니다...', '대구', '3시간 전', 200, 10),
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
                  return Card(
                    elevation: 2,
                    margin: EdgeInsets.symmetric(vertical: 8),
                    child: ListTile(
                      title: Text(
                        posts[index].title,
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(posts[index].content), // 글 내용 일부
                          SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('위치: ${posts[index].location}'),
                              Text('시간: ${posts[index].time}'),
                              Text('조회수: ${posts[index].views}'),
                              Text('댓글: ${posts[index].comments}')
                            ],
                          ),
                        ],
                      ),
                      onTap: () {
                        // 글 상세 페이지로 이동
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PostDetail(post: posts[index]),
                          ),
                        );
                      },
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
          Icons.add,
          size: 24,
        ), // + 아이콘
        backgroundColor: Colors.lightBlueAccent, // 버튼 색상
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
  final int views;
  final int comments;

  Post(this.title, this.content, this.location, this.time, this.views, this.comments);
}
