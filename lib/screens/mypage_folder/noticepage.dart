import 'package:flutter/material.dart';

class Notice {
  final String date;
  final String title;
  final String content;

  Notice({required this.date, required this.title, required this.content});
}


class NoticePage extends StatefulWidget {
  @override
  _NoticePageState createState() => _NoticePageState();
}

class _NoticePageState extends State<NoticePage> {
  // 공지사항 목록을 임의로 작성
  final List<Notice> notices = [
    Notice(date: "24/10/07", title: "“나야, 신기능” 11.1.0 업데이트 안내", content: "여기에 공지 내용이 들어갑니다."),
    Notice(date: "24/10/07", title: "iOS 15.8.3 이하 버전에 대한 최신버전 업데이트 지원 중단 안내", content: "여기에 공지 내용이 들어갑니다."),
    Notice(date: "24/08/29", title: "딥페이크 범죄 주의 및 신고 채널 안내", content: "여기에 공지 내용이 들어갑니다."),
    // 추가 데이터...
  ];

  List<bool> isExpanded = []; // 공지사항 확장 여부를 관리하는 리스트

  @override
  void initState() {
    super.initState();
    isExpanded = List.filled(notices.length, false); // 초기에는 모두 축소된 상태
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: Text("공지사항"),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: Colors.black,
      ),
      body: ListView.builder(
        itemCount: notices.length,
        itemBuilder: (context, index) {
          return Column(
            children: [
              ListTile(
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                title: Text(
                  notices[index].date,
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      notices[index].title,
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    if (isExpanded[index])
                      Padding(
                        padding: const EdgeInsets.only(top: 8.0),
                        child: Text(
                          notices[index].content,
                          style: TextStyle(fontSize: 14, color: Colors.black87),
                        ),
                      ),
                  ],
                ),
                trailing: IconButton(
                  icon: Icon(
                    isExpanded[index] ? Icons.expand_less : Icons.expand_more,
                  ),
                  onPressed: () {
                    setState(() {
                      isExpanded[index] = !isExpanded[index];
                    });
                  },
                ),
              ),
              Divider(color: Colors.grey[300]), // 각 항목 사이에 구분선 추가
            ],
          );
        },
      ),
    );
  }
}