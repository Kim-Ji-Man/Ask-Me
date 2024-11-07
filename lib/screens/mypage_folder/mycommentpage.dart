// import 'package:flutter/material.dart';
// import 'package:flutter_askme/models/post.dart';
//
// class MyCommentPage extends StatelessWidget {
//   final String currentUserNickname;
//   final List<Post> allComments;
//
//   MyCommentPage({required this.currentUserNickname, required this.allComments});
//
//   @override
//   Widget build(BuildContext context) {
//     List<Post> myComment = allComments.where((comment) => comment.author == currentUserNickname).toList();
//
//     return Scaffold(
//       appBar: AppBar(
//         leading: IconButton(
//           icon: Icon(Icons.arrow_back_ios_new),
//           onPressed: () {
//             Navigator.pop(context);
//           },
//         ),
//         title: Text("내가 작성한 댓글"),
//         backgroundColor: Colors.white,
//         foregroundColor: Colors.black,
//         elevation: 0,
//       ),
//       body: ListView.builder(
//         itemCount: myComment.length,
//         itemBuilder: (context, index) {
//           final comment = myComment[index];
//           return Padding(
//             padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
//             child: Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 Text(
//                   comment.title,
//                   style: TextStyle(fontSize: 16),
//                 ),
//                 SizedBox(height: 8),
//                 Row(
//                   children: [
//                     Text(comment.author, style: TextStyle(color: Colors.grey)),
//                     SizedBox(width: 8),
//                     Text(comment.date, style: TextStyle(color: Colors.grey)),
//                   ],
//                 ),
//                 SizedBox(height: 8),
//                 Row(
//                   children: [
//                     Icon(Icons.favorite, size: 16, color: Colors.grey),
//                     SizedBox(width: 4),
//                     Text('${comment.likes}', style: TextStyle(color: Colors.grey)),
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
