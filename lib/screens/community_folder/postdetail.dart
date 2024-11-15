import 'package:flutter/material.dart';
import 'package:flutter_askme/screens/community_folder/community.dart';
import 'package:flutter_askme/screens/community_folder/postdeletepage.dart';
import 'package:flutter_askme/screens/community_folder/posteditpage.dart';
import 'package:intl/intl.dart';
import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:io';
import 'package:flutter_askme/models/post.dart';

class Comment {
  int id;  // 댓글 ID 추가
  String content;
  String time;
  String nickname;
  int? likeCount;  // 좋아요 수
  bool isLiked;   // 좋아요 여부
  bool isReported; // 신고 여부
  int? reportCount; // 신고 수 추가

  Comment({
    required this.id,
    required this.content,
    required this.time,
    required this.nickname,
    this.likeCount, // 기본값 설정
    this.isLiked = false, // 기본값 설정
    this.isReported = false, // 기본값 설정
    this.reportCount = 0, // 신고 수 기본값 설정
  });
}

class PostDetail extends StatefulWidget {
  late final Post post;
  final String? currentUserId;

  PostDetail({required this.post, this.currentUserId});

  @override
  _PostDetailState createState() => _PostDetailState();
}

class _PostDetailState extends State<PostDetail> {
  String BaseUrl = dotenv.get("BASE_URL");
  String? currentUserId;
  bool isLiked = false;
  bool isReported = false;
  int likeCount = 0;
  int reportCount = 0;
  String? nick;

  @override
  void initState() {
    super.initState();

    // currentUserId를 먼저 불러온 후 나머지 작업 수행
    fetchCurrentUserId().then((_) {
      if (currentUserId != null) {
        fetchComments();
        fetchLikeStatus();
        fetchReportStatus();

        if (widget.post.userId.isEmpty) {
          fetchNickByUserId(currentUserId);
        } else {
          fetchNickByUserId(widget.post.userId);
        }
      } else {
        print("Failed to load user ID");
      }
    });
  }

  final List<Comment> comments = [];
  final TextEditingController commentController = TextEditingController();


  Future<void> fetchNickByUserId(String? userId) async {
    if (userId == null) {
      print("User ID is null, cannot fetch nick.");
      return;
    }

    final int parsedUserId = int.tryParse(userId) ?? -1;  // String을 int로 변환 시도
    if (parsedUserId == -1) {
      print("Invalid user ID format.");
      return;
    }

    final url = Uri.parse('$BaseUrl/community/posts');
    final response = await http.get(url, headers: {'Content-Type': 'application/json'});

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final nick = data['nick'];
      setState(() {
        widget.post = Post(
          id: widget.post.id,
          userId: userId,
          title: widget.post.title,
          content: widget.post.content,
          location: widget.post.location,
          time: widget.post.time,
          nick: nick,
          image: widget.post.image,
          views: widget.post.views,
          comments: widget.post.comments,
          likes: widget.post.likes,
          isLiked: widget.post.isLiked,
        );
      });
      print("Fetched Nickname by userId: $nick");
    } else {
      print("Failed to fetch nick. Status code: ${response.statusCode}");
    }
  }

  Future<void> fetchComments() async {
    final response = await http.get(
      Uri.parse('$BaseUrl/community/posts/${widget.post.id}/comments'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final List<dynamic> jsonData = json.decode(response.body);
      setState(() {
        comments.clear();
        comments.addAll(jsonData.map((comment) {
          String formattedTime = comment['created_at'] != null
              ? DateFormat('yy.MM.dd HH:mm').format(DateTime.parse(comment['created_at']))
              : "시간 없음";
          return Comment(
            id: comment['comment_id'],
            content: comment['content'] ?? "내용 없음",
            time: formattedTime,
            nickname: comment['nick'] ?? "알 수 없는 사용자",
            likeCount: comment['likes_count'] ?? 0,
            isLiked: comment['is_liked'] ?? false,
            isReported: comment['is_reported'] ?? false, // 서버에서 받은 신고 상태
            reportCount: comment['report_count'] ?? 0,   // 서버에서 받은 신고 수
          );
        }).toList());
      });

      // 댓글을 불러온 후 좋아요 및 신고 상태를 가져옴
      await fetchCommentLikeStatus();
    } else {
      print("Failed to load comments. Status code: ${response.statusCode}");
    }
  }

  Future<void> fetchCommentLikeStatus() async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    if (currentUserId == null) {
      print("User ID is null. Cannot fetch comment like status.");
      return;
    }

    // 서버로부터 댓글의 좋아요 상태를 가져옴
    final response = await http.post(
      Uri.parse('$BaseUrl/community/comment-likes/stat'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: json.encode({"post_id": widget.post.id, "user_id": currentUserId}),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      print("서버 응답: $data");

      setState(() {
        // 서버에서 받은 댓글 데이터 처리
        if (data['comments'] is List) {
          final List<dynamic> commentList = data['comments']; // 댓글 리스트

          for (var commentData in commentList) {
            // 각 댓글의 좋아요 상태 업데이트
            final comment = comments.firstWhere((c) => c.id == commentData['comment_id']);
            comment.isLiked = commentData['isLiked'] == 1; // 서버에서 받은 값이 0 또는 1일 수 있으므로 변환
            comment.likeCount = commentData['likes_count'] ?? 0; // 좋아요 개수 업데이트
          }
        } else if (data['comments'] is Map) {
          // 단일 객체일 경우 처리 (이 부분은 필요 없을 수도 있음)
          final commentData = data['comments'];
          final comment = comments.firstWhere((c) => c.id == commentData['comment_id']);
          comment.isLiked = commentData['isLiked'] == 1; // 서버에서 받은 값이 0 또는 1일 수 있으므로 변환
          comment.likeCount = commentData['likes_count'] ?? 0; // 좋아요 개수 업데이트
        } else {
          print('댓글 데이터 형식이 올바르지 않습니다.');
        }
      });

    } else {
      print('Failed to load comment like status. Status code: ${response.statusCode}');
    }
  }

  Future<void> toggleCommentLike(int commentId) async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    if (currentUserId == null) {
      print("User ID is null. Cannot toggle like.");
      return;
    }

    // 댓글 좋아요 상태 토글 요청
    final response = await http.post(
      Uri.parse('$BaseUrl/community/comment-likes/toggle'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: json.encode({
        "user_id": currentUserId,
        "comment_id": commentId,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = json.decode(response.body);
      print("$data 댓글 상태나오니????");

      setState(() {
        final comment = comments.firstWhere((c) => c.id == commentId);

        // 서버에서 받은 isLiked 값으로 설정하고 기본값 false로 설정
        comment.isLiked = data['isLiked'] ?? false;

        // likeCount가 null이면 기본값을 설정한 후 증가/감소
        if (comment.isLiked) {
          comment.likeCount = (comment.likeCount ?? 0) + 1; // 좋아요 수 증가
        } else {
          comment.likeCount = (comment.likeCount ?? 0) - 1; // 좋아요 수 감소
        }
      });

    } else {
      print("Failed to toggle like. Status code: ${response.statusCode}");
    }
  }

  Future<void> reportComment(int commentId, List<int> reasonIds) async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    if (currentUserId == null) {
      print("User ID is null. Cannot report comment.");
      return;
    }

    // Optimistically update UI before server response
    setState(() {
      final comment = comments.firstWhere((c) => c.id == commentId);
      comment.isReported = true;
      comment.reportCount = (comment.reportCount ?? 0) + 1; // Increment report count
    });

    final response = await http.post(
      Uri.parse('$BaseUrl/community/comment-reports/comment'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: json.encode({
        "comment_id": commentId,
        "user_id": currentUserId,
        "reason_ids": reasonIds,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = json.decode(response.body);

      // Update UI with actual data from server
      setState(() {
        final comment = comments.firstWhere((c) => c.id == commentId);
        if (data.containsKey('reportCount')) {
          comment.reportCount = data['reportCount'];
        }
      });

      print("Report successful!");
    } else {
      // Revert optimistic update if request fails
      setState(() {
        final comment = comments.firstWhere((c) => c.id == commentId);
        comment.isReported = false;
        comment.reportCount = (comment.reportCount ?? 1) - 1; // Revert report count
      });
      print("Failed to report comment. Status code: ${response.statusCode}");
    }
  }
  Future<void> toggleCommentReport(int commentId) async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    if (currentUserId == null) {
      print("User ID is null. Cannot toggle report.");
      return;
    }

    // Optimistically toggle UI state before server response
    setState(() {
      final comment = comments.firstWhere((c) => c.id == commentId);

      // Toggle isReported and adjust reportCount accordingly
      if (comment.isReported == true) {
        comment.isReported = false;
        if (comment.reportCount != null && comment.reportCount! > 0) {
          comment.reportCount = comment.reportCount! - 1; // Decrease report count
        }
      } else {
        comment.isReported = true;
        comment.reportCount = (comment.reportCount ?? 0) + 1; // Increase report count
      }
    });

    final response = await http.post(
      Uri.parse('$BaseUrl/community/comment-reports/status'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: json.encode({
        "comment_id": commentId,
        "user_id": currentUserId,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = json.decode(response.body);

      setState(() {
        final comment = comments.firstWhere((c) => c.id == commentId);
        // Update with actual server data
        comment.isReported = data['isReported'] ?? false;

        if (data['isReported']) {
          if (comment.reportCount != null) {
            comment.reportCount = data['reportCount'];
          } else {
            comment.reportCount = 1; // Default to 1 if no count exists
          }
        } else {
          if (comment.reportCount != null && comment.reportCount! > 0) {
            comment.reportCount = data['reportCount'];
          } else {
            comment.reportCount = 0; // Default to 0
          }
        }
      });

    } else if (response.statusCode == 403) {
      print("Already reported this comment.");
    } else {
      print("Failed to toggle report. Status code: ${response.statusCode}");
    }
  }

  Future<void> editPost(String newTitle, String newContent, String? newImage) async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    final response = await http.put(
      Uri.parse('$BaseUrl/community/posts/${widget.post.id}'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({
        "title": newTitle,
        "content": newContent,
        "image": newImage ?? widget.post.image,
      }),
    );

    if (response.statusCode == 200) {
      setState(() {
        widget.post = Post(
          id: widget.post.id,
          userId: widget.post.userId,
          title: newTitle,
          content: newContent,
          image: newImage ?? widget.post.image,
          location: widget.post.location,
          time: widget.post.time,
          nick: widget.post.nick,
          views: widget.post.views,
          comments: widget.post.comments,
          likes: widget.post.likes,
          isLiked: widget.post.isLiked,
        );
      });
      print("Post updated successfully.");
    } else {
      print("Failed to update post. Status code: ${response.statusCode}");
    }
  }

  Future<void> deletePost() async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    final response = await http.delete(
      Uri.parse('$BaseUrl/community/posts/${widget.post.id}'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      Navigator.pop(context, true);
      print("Post deleted successfully.");
    } else {
      print("Failed to delete post. Status code: ${response.statusCode}");
    }
  }

  Future<void> fetchCurrentUserId() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token != null) {
      print("Retrieved token: $token");
      final parts = token.split('.');
      if (parts.length == 3) {
        final payload = json.decode(
          utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
        );
        setState(() {
          currentUserId = payload['userId'].toString();
        });
        print("Fetched User ID from Token: $currentUserId");
      } else {
        print("Invalid token format.");
      }
    } else {
      print("No token found. Current User ID not set.");
    }
  }

  Future<void> fetchLikeStatus() async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    if (currentUserId == null) {
      print("User ID is null. Cannot toggle like1.");
      return;
    }

      final response = await http.post(
        Uri.parse('$BaseUrl/community/likes/stat'),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
        body: json.encode({"post_id": widget.post.id, "user_id": currentUserId}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          isLiked = data['isLiked']; // 서버에서 받아온 좋아요 상태로 업데이트
          likeCount = data['likeCount']; // 좋아요 개수 업데이트
        });
      } else {
        print('Failed to load like status. Status code: ${response.statusCode}');
      }

  }

  Future<void> toggleLike() async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    if (currentUserId == null) {
      print("User ID is null. Cannot toggle like.");
      return;
    }

    // Send request to toggle like status
    final response = await http.post(
      Uri.parse('$BaseUrl/community/likes/toggle'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: json.encode({"post_id": widget.post.id, "user_id": currentUserId}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = json.decode(response.body);

      setState(() {
        // Toggle the isLiked state based on response
        isLiked = !isLiked; // Toggle like status
        if (isLiked) {
          likeCount++; // Increment like count if liked
        } else {
          likeCount--; // Decrement like count if unliked
        }
      });

      print("Like status updated: isLiked=$isLiked, likeCount=$likeCount");
    } else {
      print("Failed to toggle like. Status code: ${response.statusCode}");
    }
  }

  Future<void> showReportDialog() async {
    final List<String> reportOptions = ['광고/홍보', '기타', '도배', '욕설/비방', '음란성'];
    List<bool> selectedOptions = List<bool>.filled(reportOptions.length, false); // 선택 여부를 저장하는 리스트

    await showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("신고 사유를 선택해주세요"),
          content: StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // 신고 옵션 리스트
                  ...reportOptions.asMap().entries.map((entry) {
                    int index = entry.key;
                    String option = entry.value;

                    return CheckboxListTile(
                      title: Text(option),
                      value: selectedOptions[index],
                      onChanged: (bool? value) {
                        setState(() {
                          selectedOptions[index] = value ?? false; // 체크박스 상태 변경
                        });
                      },
                    );
                  }).toList(),
                ],
              );
            },
          ),
          actions: [
            TextButton(
              child: Text("취소"),
              onPressed: () {
                Navigator.of(context).pop(); // 다이얼로그 닫기
              },
            ),
            TextButton(
              child: Text("확인"),
              onPressed: () {
                List<int> selectedReasonIds = [];
                for (int i = 0; i < reportOptions.length; i++) {
                  if (selectedOptions[i]) {
                    selectedReasonIds.add(i + 1); // reason_id는 1부터 시작한다고 가정
                  }
                }

                if (selectedReasonIds.isNotEmpty) {
                  reportPost(selectedReasonIds); // 선택된 사유로 신고 요청 보내기
                }

                Navigator.of(context).pop(); // 다이얼로그 닫기
              },
            ),
          ],
        );
      },
    );
  }

  Future<void> fetchReportStatus() async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    if (currentUserId == null) {
      print("User ID is null. Cannot fetch report status.");
      return;
    }

    final response = await http.post(
      Uri.parse('$BaseUrl/community/reports/status'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: json.encode({"post_id": widget.post.id, "user_id": currentUserId}),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      setState(() {
        isReported = data['isReported']; // 서버에서 받아온 신고 여부로 업데이트
        reportCount = data['reportCount']; // 서버에서 받아온 신고 횟수로 업데이트
      });
      print("Fetched report status: isReported=$isReported, reportCount=$reportCount");
    } else {
      print('Failed to load report status. Status code: ${response.statusCode}');
    }
  }

  Future<void> reportPost(List<int> reasonIds) async {
    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));
    if (currentUserId == null) {
      print("User ID is null. Cannot report post.");
      return;
    }

    final response = await http.post(
      Uri.parse('$BaseUrl/community/reports'), // 서버의 신고 API 엔드포인트
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
      body: json.encode({
        "post_id": widget.post.id,
        "user_id": currentUserId,
        "reason_ids": reasonIds, // 선택된 신고 사유 리스트 전송
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      setState(() {
        isReported = true; // 신고가 성공적으로 이루어지면 상태 변경
        reportCount++; // 신고 횟수 증가
      });
      print("Report successful!");
    } else {
      print("Failed to report post. Status code: ${response.statusCode}");
    }
  }

  Future<String?> getUserIdFromToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return null;

    final parts = token.split('.');
    if (parts.length != 3) throw Exception('Invalid token');

    final payload = json.decode(
      utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
    );
    return payload['userId'].toString();
  }

  Future<void> showCommentReportDialog(int commentId) async {
    final List<String> reportOptions = ['광고/홍보', '기타', '도배', '욕설/비방', '음란성'];
    List<bool> selectedOptions = List<bool>.filled(reportOptions.length, false);

    await showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("신고 사유를 선택해주세요"),
          content: StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: reportOptions.asMap().entries.map((entry) {
                  int index = entry.key;
                  String option = entry.value;
                  return CheckboxListTile(
                    title: Text(option),
                    value: selectedOptions[index],
                    onChanged: (bool? value) {
                      setState(() {
                        selectedOptions[index] = value ?? false;
                      });
                    },
                  );
                }).toList(),
              );
            },
          ),
          actions: [
            TextButton(child: Text("취소"), onPressed: () => Navigator.of(context).pop()),
            TextButton(child: Text("확인"), onPressed: () {
              List<int> selectedReasonIds = [];
              for (int i = 0; i < reportOptions.length; i++) {
                if (selectedOptions[i]) selectedReasonIds.add(i + 1);
              }
              if (selectedReasonIds.isNotEmpty) reportComment(commentId, selectedReasonIds);
              Navigator.of(context).pop();
            }),
          ],
        );
      },
    );
  }

  Future<void> addComment(String content) async {
    final userId = await getUserIdFromToken();
    if (userId == null) {
      print("User ID is null. Cannot add comment.");
      return;
    }

    final commentData = {
      "post_id": widget.post.id,
      "user_id": userId,
      "content": content,
    };

    final token = await SharedPreferences.getInstance().then((prefs) => prefs.getString('token'));

    final response = await http.post(
      Uri.parse('$BaseUrl/community/comments'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(commentData),
    );

    if (response.statusCode == 201) {
      await fetchComments();
      commentController.clear();
    } else {
      print("Failed to add comment. Status code: ${response.statusCode}");
    }
  }

  Future<String?> uploadImage(File imageFile) async {
    final url = Uri.parse('$BaseUrl/community/posts');
    final request = http.MultipartRequest('POST', url);

    request.files.add(
      await http.MultipartFile.fromPath(
        'image',
        imageFile.path,
      ),
    );

    final response = await request.send();

    if (response.statusCode == 200) {
      final responseBody = await http.Response.fromStream(response);
      final data = jsonDecode(responseBody.body);
      return data['imageUrl'];
    } else {
      print('Failed to upload image. Status code: ${response.statusCode}');
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isAuthor = currentUserId == widget.post.userId.toString();
    print("Current User ID: $currentUserId");
    print("Post Author User ID: ${widget.post.userId}");

    String imageUrl = widget.post.image != null && widget.post.image!.isNotEmpty
        ? '$BaseUrl/${widget.post.image}'
        : 'images/img_logo.png';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (isAuthor)
            PopupMenuButton<String>(
              icon: Icon(Icons.more_vert),
              onSelected: (value) async {
                if (value == 'edit') {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => PostEditPage(
                        postId: widget.post.id,
                        initialTitle: widget.post.title,
                        initialContent: widget.post.content,
                      ),
                    ),
                  );
                  if (result is Map<String, String>) {
                    await editPost(result['title']!, result['content']!, result['image']);
                  }
                } else if (value == 'delete') {
                  await deletePost();
                }
              },
              itemBuilder: (context) => [
                PopupMenuItem(value: 'edit', child: Text('수정')),
                PopupMenuItem(value: 'delete', child: Text('삭제')),
              ],
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.post.nick, style: TextStyle(fontWeight: FontWeight.bold)),
                    Text(widget.post.time),
                  ],
                ),
              ],
            ),
            SizedBox(height: 30),
            Text(
              widget.post.title,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            Text(widget.post.content),
            SizedBox(height: 30),
            if (widget.post.image != null && widget.post.image!.isNotEmpty)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.network(
                  imageUrl,
                  width: double.infinity,
                  fit: BoxFit.contain,
                ),
              ),
            SizedBox(height: 16),
            Row(
              children: [
                // 좋아요 버튼
                IconButton(
                  icon: Icon(
                    isLiked ? Icons.favorite : Icons.favorite_border,
                    color: isLiked ? Colors.red : Colors.grey,
                  ),
                  onPressed: toggleLike, // 좋아요 상태 토글 함수
                ),
                Text('$likeCount'), // 좋아요 개수 표시

                SizedBox(width: 16), // 간격 추가

                // 신고 버튼
                IconButton(
                  icon: Icon(
                      isReported ? Icons.flag : Icons.flag_outlined,
                      color: isReported? Colors.red : Colors.grey
                  ),
                  onPressed: showReportDialog, // 신고 다이얼로그 호출 함수
                ),
                Text('신고 ($reportCount)'),  // 신고 횟수 표시
              ],
            ),
            Divider(
              thickness: 3.0,
              color: Colors.grey[300],
            ),
            ListView.builder(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              reverse: true,
              itemCount: comments.length,
              itemBuilder: (context, index) {
                final comment = comments[index];

                return ListTile(
                  leading: Text(
                    comment.nickname,
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                  title: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(comment.content, style: TextStyle(fontSize: 13)),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(comment.time, style: TextStyle(fontSize: 10, color: Colors.grey)),
                          Row(
                            children: [
                              IconButton(
                                iconSize: 16,
                                icon: Icon(
                                  comment.isLiked ? Icons.favorite : Icons.favorite_border,
                                  color: comment.isLiked ? Colors.red : Colors.grey,
                                ),
                                onPressed: () => toggleCommentLike(comment.id),
                              ),
                              Text('${comment.likeCount}', style: TextStyle(fontSize: 12)),
                              IconButton(
                                iconSize: 16,
                                icon: Icon(
                                  comment.isReported ? Icons.flag : Icons.flag_outlined,
                                  color: comment.isReported ? Colors.red : Colors.grey,
                                ),
                                onPressed: () => showCommentReportDialog(comment.id),
                              ),
                              Text('${comment.reportCount}', style: TextStyle(fontSize: 12)),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            )
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          children: [
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
                  contentPadding: EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
                ),
              ),
            ),
            IconButton(
              icon: Icon(Icons.send, color: Colors.blue),
              onPressed: () {
                if (commentController.text.isNotEmpty) {
                  addComment(commentController.text);
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
