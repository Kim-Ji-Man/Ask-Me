import 'package:flutter/material.dart';
import 'dart:io';
import 'community.dart';

class PostDetail extends StatefulWidget {
  final Post post;

  PostDetail({required this.post});

  @override
  _PostDetailState createState() => _PostDetailState();
}

class _PostDetailState extends State<PostDetail> {
  final List<String> comments = []; // 댓글 목록
  final TextEditingController commentController = TextEditingController(); // 댓글 입력 컨트롤러

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(widget.post.title),
        actions: [
          IconButton(icon: Icon(Icons.notifications), onPressed: () {}),
          IconButton(icon: Icon(Icons.share), onPressed: () {}),
          IconButton(icon: Icon(Icons.more_vert), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 프로필 사진과 닉네임, 시간
            Row(
              children: [
                CircleAvatar(
                  backgroundImage: AssetImage('assets/profile.jpg'), // 프로필 사진
                  radius: 20,
                ),
                SizedBox(width: 10),
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
            // 제목 및 내용
            Text(widget.post.title, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            SizedBox(height: 10),
            Text(widget.post.content),
            SizedBox(height: 20),
            // 조회수
            Text('조회수: ${widget.post.views}', style: TextStyle(color: Colors.grey)),
            SizedBox(height: 20),
            // "궁금해요", "답변하기", "관심" 버튼들
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: Icon(Icons.help_outline),
                  label: Text('궁금해요'),
                ),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: Icon(Icons.chat_bubble_outline),
                  label: Text('답변하기'),
                ),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: Icon(Icons.favorite_border),
                  label: Text('관심'),
                ),
              ],
            ),
            Divider(),
            SizedBox(height: 10),
            // 댓글 목록
            ListView.builder(
              shrinkWrap: true,
              itemCount: comments.length,
              itemBuilder: (context, index) {
                return ListTile(
                  leading: CircleAvatar(child: Icon(Icons.person)),
                  title: Text(comments[index]),
                );
              },
            ),
            SizedBox(height: 10),
            // 댓글 입력창
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: commentController,
                    decoration: InputDecoration(
                      hintText: '댓글을 입력하세요',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.send),
                  onPressed: () {
                    setState(() {
                      comments.add(commentController.text);
                      commentController.clear();
                    });
                  },
                ),
              ],
            ),
            // 사진 및 위치 버튼
            SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: Icon(Icons.photo),
                  label: Text('사진'),
                ),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: Icon(Icons.location_on),
                  label: Text('위치'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// Post 클래스는 community.dart에서 정의되어 있으므로 중복 정의 필요 없음
