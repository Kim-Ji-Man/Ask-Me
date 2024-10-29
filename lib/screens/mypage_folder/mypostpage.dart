import 'package:flutter/material.dart';
import 'package:flutter_askme/models/post.dart';

class MyPostPage extends StatelessWidget {
  final String currentUserNickname;
  final List<Post> allPosts;

  MyPostPage({required this.currentUserNickname, required this.allPosts});

  @override
  Widget build(BuildContext context) {
    List<Post> myPosts = allPosts.where((post) => post.author == currentUserNickname).toList();

    return Scaffold(
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
      body: ListView.builder(
        itemCount: myPosts.length,
        itemBuilder: (context, index) {
          final post = myPosts[index];
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (post.thumbnailUrl != null)
                      Container(
                        width: 80,
                        height: 80,
                        margin: EdgeInsets.only(right: 12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8),
                          image: DecorationImage(
                            image: NetworkImage(post.thumbnailUrl!),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            post.title,
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          SizedBox(height: 8),
                          Row(
                            children: [
                              Text(post.author, style: TextStyle(color: Colors.grey)),
                              SizedBox(width: 8),
                              Text(post.date, style: TextStyle(color: Colors.grey)),
                            ],
                          ),
                          SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.visibility, size: 16, color: Colors.grey),
                              SizedBox(width: 4),
                              Text('${post.views}', style: TextStyle(color: Colors.grey)),
                              SizedBox(width: 16),
                              Icon(Icons.comment, size: 16, color: Colors.grey),
                              SizedBox(width: 4),
                              Text('${post.comments}', style: TextStyle(color: Colors.grey)),
                              SizedBox(width: 16),
                              Icon(Icons.favorite, size: 16, color: Colors.grey),
                              SizedBox(width: 4),
                              Text('${post.likes}', style: TextStyle(color: Colors.grey)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                Divider(color: Colors.grey[300]),
              ],
            ),
          );
        },
      ),
    );
  }
}
