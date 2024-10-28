import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/community.dart';
import 'package:intl/intl.dart'; // 시간을 포맷팅하기 위한 패키지

// 클래스 외부에 Comment 클래스를 선언
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
  final List<Comment> comments = []; // 댓글 목록을 List<Comment>로 변경
  final TextEditingController commentController = TextEditingController(); // 댓글 입력 컨트롤러

  bool isLiked = false;
  int likeCount = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                          Text("닉네임", style: TextStyle(fontWeight: FontWeight.bold)),
                          Text(widget.post.time),
                        ],
                      ),
                    ],
                  ),
                  SizedBox(height: 20),
                  Text(widget.post.title, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  SizedBox(height: 10),
                  Text(widget.post.content),
                  SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Text('조회 ${widget.post.views}', style: TextStyle(color: Colors.grey)),
                      SizedBox(width: 16),
                      TextButton.icon(
                        onPressed: () {
                          setState(() {
                            isLiked = !isLiked;
                            if (isLiked) {
                              likeCount++;
                            } else {
                              likeCount--;
                            }
                          });
                        },
                        icon: Icon(
                          isLiked ? Icons.favorite : Icons.favorite_border, // 공감 여부에 따른 하트 아이콘
                          color: isLiked ? Colors.red : Colors.grey, // 색상 변경
                        ),
                        label: Text('공감 $likeCount',
                          style: TextStyle(color: Colors.grey),),
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size(0, 0),
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ),
                    ],
                  ),
                  Divider(),
                  SizedBox(height: 10),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    reverse: true, // 댓글이 아래에서 위로 쌓이도록 설정
                    itemCount: comments.length,
                    itemBuilder: (context, index) {
                      return ListTile(
                        leading: Text(
                          comments[index].nickname,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        title: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(comments[index].content),
                            SizedBox(height: 5),
                            Text(
                              comments[index].time,
                              style: TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                          ],
                        ),
                        trailing: PopupMenuButton<String>(
                          onSelected: (value) {
                            if (value == 'edit') {
                              // 댓글 수정 기능
                            } else if (value == 'delete') {
                              setState(() {
                                comments.removeAt(index); // 댓글 삭제
                              });
                            }
                          },
                          itemBuilder: (context) => [
                            PopupMenuItem(value: 'edit', child: Text('수정')),
                            PopupMenuItem(value: 'delete', child: Text('삭제')),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          // 댓글 입력창 및 사진/위치 버튼
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                IconButton(
                  icon: Icon(Icons.photo),
                  onPressed: () {
                    // 사진 추가 기능
                  },
                ),
                IconButton(
                  icon: Icon(Icons.location_on),
                  onPressed: () {
                    // 위치 추가 기능
                  },
                ),
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
                      contentPadding: EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0), // 패딩 조정
                    ),
                    onSubmitted: (value) {
                      setState(() {
                        // 닉네임 설정 (여기서는 고정된 "사용자"로 설정)
                        String nickname = "사용자";
                        // 현재 시간을 포맷하여 저장
                        String formattedTime = DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.now());
                        comments.add(Comment(value, formattedTime, nickname));
                        commentController.clear();
                      });
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
