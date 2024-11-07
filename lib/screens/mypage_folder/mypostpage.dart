// import 'dart:convert';
// import 'package:flutter/material.dart';
// import 'package:flutter_askme/models/post.dart';
// import 'package:shared_preferences/shared_preferences.dart';
//
// class MyPostPage extends StatefulWidget {
//   final List<Post> allPosts;
//
//   MyPostPage({required this.allPosts});
//
//   @override
//   _MyPostPageState createState() => _MyPostPageState();
// }
//
// class _MyPostPageState extends State<MyPostPage> {
//   String? currentUserId;
//
//   @override
//   void initState() {
//     super.initState();
//     loadCurrentUserId();
//   }
//
//   // 토큰에서 user_id를 가져오는 함수
//   Future<void> loadCurrentUserId() async {
//     final prefs = await SharedPreferences.getInstance();
//     final token = prefs.getString('token');
//
//     if (token != null) {
//       final parts = token.split('.');
//       final payload = json.decode(
//         utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
//       );
//       setState(() {
//         currentUserId = payload['user_id'].toString(); // 현재 로그인한 사용자의 user_id 저장
//       });
//     }
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     if (currentUserId == null) {
//       // user_id를 불러오는 동안 로딩 화면 표시
//       return Scaffold(
//         appBar: AppBar(
//           title: Text("내가 작성한 글"),
//           backgroundColor: Colors.white,
//           foregroundColor: Colors.black,
//           elevation: 0,
//         ),
//         body: Center(child: CircularProgressIndicator()),
//       );
//     }
//
//     // 현재 로그인한 사용자와 user_id가 일치하는 게시글 필터링
//     List<Post> myPosts = widget.allPosts.where((post) => post.userId == currentUserId).toList();
//
//     return Scaffold(
//       appBar: AppBar(
//         leading: IconButton(
//           icon: Icon(Icons.arrow_back_ios_new),
//           onPressed: () {
//             Navigator.pop(context);
//           },
//         ),
//         title: Text("내가 작성한 글"),
//         backgroundColor: Colors.white,
//         foregroundColor: Colors.black,
//         elevation: 0,
//       ),
//       body: ListView.builder(
//         itemCount: myPosts.length,
//         itemBuilder: (context, index) {
//           final post = myPosts[index];
//           return Padding(
//             padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
//             child: Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 Row(
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: [
//                     if (post.thumbnailUrl != null)
//                       Container(
//                         width: 80,
//                         height: 80,
//                         margin: EdgeInsets.only(right: 12),
//                         decoration: BoxDecoration(
//                           borderRadius: BorderRadius.circular(8),
//                           image: DecorationImage(
//                             image: NetworkImage(post.thumbnailUrl!),
//                             fit: BoxFit.cover,
//                           ),
//                         ),
//                       ),
//                     Expanded(
//                       child: Column(
//                         crossAxisAlignment: CrossAxisAlignment.start,
//                         children: [
//                           Text(
//                             post.title,
//                             style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
//                             maxLines: 2,
//                             overflow: TextOverflow.ellipsis,
//                           ),
//                           SizedBox(height: 8),
//                           Row(
//                             children: [
//                               Text(post.author, style: TextStyle(color: Colors.grey)),
//                               SizedBox(width: 8),
//                               Text(post.date, style: TextStyle(color: Colors.grey)),
//                             ],
//                           ),
//                           SizedBox(height: 8),
//                           Row(
//                             children: [
//                               Icon(Icons.visibility, size: 16, color: Colors.grey),
//                               SizedBox(width: 4),
//                               Text('${post.views}', style: TextStyle(color: Colors.grey)),
//                               SizedBox(width: 16),
//                               Icon(Icons.comment, size: 16, color: Colors.grey),
//                               SizedBox(width: 4),
//                               Text('${post.comments}', style: TextStyle(color: Colors.grey)),
//                               SizedBox(width: 16),
//                               Icon(Icons.favorite, size: 16, color: Colors.grey),
//                               SizedBox(width: 4),
//                               Text('${post.likes}', style: TextStyle(color: Colors.grey)),
//                             ],
//                           ),
//                         ],
//                       ),
//                     ),
//                   ],
//                 ),
//                 Divider(color: Colors.grey[300]),
//               ],
//             ),
//           );
//         },
//       ),
//     );
//   }
// }
