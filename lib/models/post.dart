class Post {
  String title;
  String author;
  String date;
  int views;
  int comments;
  int likes;
  String? thumbnailUrl;

  Post({
    required this.title,
    required this.author,
    required this.date,
    required this.views,
    required this.comments,
    required this.likes,
    this.thumbnailUrl,
  });
}
