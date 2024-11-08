// import 'package:intl/intl.dart';
//
// class Post {
//   final String id;
//   final String userId; // 게시글 작성자의 user_id
//   final String title;
//   final String content;
//   final String location;
//   final String time;
//   final String nick;
//   final String image;
//   int views;
//   int comments;
//   int likes;
//   bool isLiked;
//
//   Post({
//     required this.id,
//     required this.userId,
//     required this.title,
//     required this.image,
//     required this.content,
//     required this.location,
//     required this.time,
//     required this.nick,
//     required this.views,
//     required this.comments,
//     required this.likes,
//     required this.isLiked,
//   });
//
//   // JSON으로부터 Post 객체 생성
//   factory Post.fromJson(Map<String, dynamic> json) {
//     return Post(
//       id: json['post_id'].toString(),
//       userId: json['user_id'].toString(), // JSON에서 user_id 가져오기
//       title: json['title'],
//       image: json['image'],
//       content: json['content'],
//       location: json['location'] ?? '',
//       time: Post.formatDate(json['created_at']),
//       nick: json['nick'] ?? '알 수 없는 사용자',
//       views: json['views'] ?? 0,
//       comments: json['comments'] ?? 0,
//       likes: json['likes'] ?? 0,
//       isLiked: json['is_liked'] ?? false,
//     );
//   }
//
//   // 날짜 형식 변환 함수
//   static String formatDate(String createdAt) {
//     final DateTime dateTime = DateTime.parse(createdAt);
//     return DateFormat('yyyy-MM-dd HH:mm').format(dateTime);
//   }
// }
