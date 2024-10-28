import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart'; // 이미지 픽커 패키지 추가
import 'dart:io';


class CommunityPost extends StatefulWidget {
  @override
  _CommunityPostState createState() => _CommunityPostState();
}

class _CommunityPostState extends State<CommunityPost> {
  File? _image; // 사용자가 선택한 이미지를 저장할 변수
  final ImagePicker _picker = ImagePicker(); // 이미지 픽커 인스턴스
  List<XFile?> images = []; // 선택된 이미지들을 저장할 리스트


  // 갤러리에서 이미지 가져오기
  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        images.add(pickedFile); // 선택한 이미지를 리스트에 추가
      });
    }
  }

  // 카메라에서 이미지 가져오기
  Future<void> _pickImageFromCamera() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.camera);
    if (pickedFile != null) {
      setState(() {
        images.add(pickedFile); // 선택한 이미지를 리스트에 추가
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text(
          '글쓰기',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.close),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        actions: [
          TextButton(
            onPressed: () {
              // 글 작성 완료 로직
            },
            child: Text(
              '완료',
              style: TextStyle(
                color: Colors.black,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              decoration: InputDecoration(
                hintText: '제목을 입력하세요',
                border: InputBorder.none, // 밑줄 없애기
              ),
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              keyboardType: TextInputType.text, // 키보드가 자동으로 뜨게 함
            ),
            Expanded(
              child: TextField(
                decoration: InputDecoration(
                  hintText: '내용을 입력하세요',
                  border: InputBorder.none,
                ),
                maxLines: null,
                style: TextStyle(fontSize: 16),
                keyboardType: TextInputType.multiline,
              ),
            ),
            Divider(), // 구분선 추가 (선택사항)
            SizedBox(height: 10),
            // 선택된 이미지들이 표시되는 부분
            if (images.isNotEmpty)
              GridView.builder(
                padding: EdgeInsets.all(0),
                shrinkWrap: true,
                itemCount: images.length, // 보여줄 item 개수
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3, // 1 개의 행에 보여줄 사진 개수
                  childAspectRatio: 1 / 1, // 사진의 가로 세로 비율
                  mainAxisSpacing: 10, // 수평 Padding
                  crossAxisSpacing: 10, // 수직 Padding
                ),
                itemBuilder: (BuildContext context, int index) {
                  return Stack(
                    alignment: Alignment.topRight,
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(5),
                          image: DecorationImage(
                            fit: BoxFit.cover,  // 사진을 크기를 상자 크기에 맞게 조절
                            image: FileImage(File(images[index]!.path)), // images 리스트 변수 안에 있는 사진들을 순서대로 표시함
                          ),
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.black,
                          borderRadius: BorderRadius.circular(5),
                        ),
                        // 삭제 버튼
                        child: IconButton(
                          padding: EdgeInsets.zero,
                          constraints: BoxConstraints(),
                          icon: Icon(Icons.close, color: Colors.white, size: 15),
                          onPressed: () {
                            // 버튼을 누르면 해당 이미지가 삭제됨
                            setState(() {
                              images.removeAt(index); // 해당 인덱스의 이미지를 삭제
                            });
                          },
                        ),
                      ),
                    ],
                  );
                },
              ),
            SizedBox(height: 10),
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: _pickImage, // 사진 버튼 누르면 갤러리로 이동
                  icon: Icon(Icons.photo),
                  label: Text('갤러리'),
                ),
                SizedBox(width: 10),
                ElevatedButton.icon(
                  onPressed: _pickImageFromCamera, // 카메라 버튼 누르면 카메라로 이동
                  icon: Icon(Icons.camera),
                  label: Text('카메라'),
                ),
              ],
            ),
            SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
