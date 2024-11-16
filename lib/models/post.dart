import 'package:intl/intl.dart';

class Post {
  final String id;
  final String userId; // 게시글 작성자의 user_id
  String title;
  String content;
  final String location;
  final String time;
  String nick;
  final String? image;
  int views;
  int comments;
  int likes;
  bool isLiked;

  Post({
    required this.id,
    required this.userId,
    required this.title,
    this.image,
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
      userId: (json['user_id'] ?? '').toString(),
      title: json['title'] ?? '',
      image: json['image'] as String?,
      content: json['content'] ?? '',
      location: json['location'] ?? '',
      time: formatDate(json['created_at'] ?? DateTime.now().toString()), // 날짜 형식 변환 적용
      nick: json['nick'] ?? '알 수 없는 사용자',
      views: json['views'] ?? 0,
      comments: json['comment_count'] ?? 0,
      likes: json['likes_count'] ?? 0,
      isLiked: json['is_liked'] ?? false,
    );
  }

  // 날짜 형식 변환 함수
  static String formatDate(String createdAt) {
    try {
      final DateTime dateTime = DateTime.parse(createdAt).toLocal(); // UTC 시간을 로컬 시간으로 변환
      return DateFormat('yyyy-MM-dd HH:mm').format(dateTime);
    } catch (e) {
      return DateFormat('yyyy-MM-dd HH:mm').format(DateTime.now());
    }
  }
}
