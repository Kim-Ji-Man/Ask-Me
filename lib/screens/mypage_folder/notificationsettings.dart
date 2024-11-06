import 'package:flutter/material.dart';

class NotificationSettings extends StatefulWidget {
  @override
  _NotificationSettingsState createState() => _NotificationSettingsState();
}

class _NotificationSettingsState extends State<NotificationSettings> {
  bool isPushNotificationEnabled = false;
  bool isNewCommentNotificationEnabled = false;
  bool isLocationServiceEnabled = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: Text('알림설정'),
        backgroundColor: Colors.white,
      ),
      body: Container(
        color: Colors.white,
        child: ListView(
          padding: EdgeInsets.all(16),
          children: [
            ListTile(
              title: Text('푸시 알림',
                style: TextStyle(
                  fontWeight: FontWeight.bold,),
              ),
              subtitle: Text('푸시알림에 대한 설정은 아이폰 알림센터에서 확인 하실 수 있습니다.',
                style: TextStyle(
                fontSize: 12,
              ),
              ),
              trailing: Switch(
                value: isPushNotificationEnabled,
                onChanged: (value) {
                  setState(() {
                    isPushNotificationEnabled = value;
                  });
                },
                activeColor: Colors.white,
                inactiveThumbColor: Colors.grey,
                activeTrackColor: Colors.blue[500],
                inactiveTrackColor: Colors.grey[200],
              ),
            ),
            Divider(),
            ListTile(
              title: Text('신규 댓글',
                style: TextStyle(
                fontWeight: FontWeight.bold,),),
              subtitle: Text('작성한 게시글에 댓글이 등록되면 알림으로 받을 수 있습니다.',
                style: TextStyle(
                  fontSize: 12,
                ),),
              trailing: Switch(
                value: isNewCommentNotificationEnabled,
                onChanged: (value) {
                  setState(() {
                    isNewCommentNotificationEnabled = value;
                  });
                },
                activeColor: Colors.white,
                inactiveThumbColor: Colors.grey,
                activeTrackColor: Colors.blue[500],
                inactiveTrackColor: Colors.grey[200],
              ),
            ),
            Divider(),
            ListTile(
              title: Text('위치 정보 서비스 이용약관 동의',
                style: TextStyle(
                  fontWeight: FontWeight.bold,),),
              subtitle: Text('지도 서비스 이용을 원하시면 위치 정보 서비스 이용약관에 동의해주세요.',
                  style: TextStyle(
                  fontSize: 12,
                ),),
              trailing: Switch(
                value: isLocationServiceEnabled,
                onChanged: (value) {
                  setState(() {
                    isLocationServiceEnabled = value;
                  });
                },
                activeColor: Colors.white,
                inactiveThumbColor: Colors.grey,
                activeTrackColor: Colors.blue[500],
                inactiveTrackColor: Colors.grey[200],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
