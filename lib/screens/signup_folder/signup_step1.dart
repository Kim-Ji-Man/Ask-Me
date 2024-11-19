import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'signup_step2.dart'; // 새로 만든 페이지를 임포트합니다.
import 'package:provider/provider.dart'; // Provider 패키지 임포트
import 'package:flutter_askme/models/signup_data.dart';
import 'package:dio/dio.dart'; // Dio 패키지 임포트

class SignUpStep1 extends StatefulWidget {
  final bool isGuard;

  SignUpStep1({this.isGuard = true});

  @override
  _SignUpStep1State createState() => _SignUpStep1State();
}

class _SignUpStep1State extends State<SignUpStep1> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _storeNameController = TextEditingController();
  final TextEditingController _nickController =
  TextEditingController(); // nickname -> nick으로 변경
  final TextEditingController _emailController = TextEditingController();

  List<Map<String, dynamic>> _storeList = [];
  int? _selectedStoreId;
  String BaseUrl = dotenv.get("BASE_URL");
  final Dio _dio = Dio(); // Dio 인스턴스 생성

  @override
  void initState() {
    super.initState();
    if (widget.isGuard) {
      _fetchStores(); // 경비원일 경우에만 매장 리스트를 가져옴
    }
  }

  Future<void> _fetchStores() async {
    try {
      final response = await _dio.get('$BaseUrl/stores/names');
      print(response.data); // 서버 응답 데이터 출력
      if (response.statusCode == 200) {
        List<dynamic> stores = response.data;
        setState(() {
          _storeList = stores
              .map((store) => {
            'id': store['store_id'], // 'id' 대신 'store_id' 사용
            'name': store['name'],
          })
              .toList();
        });
      } else {
        print('Failed to load store list');
      }
    } catch (e) {
      print('Error fetching store list: $e');
    }
  }

  void _onStoreSelected(Map<String, dynamic> store) {
    setState(() {
      _storeNameController.text = store['name'];
      _selectedStoreId = store['id']; // 선택된 매장의 ID 저장
    });

    // SignUpData에 접근하여 storeId를 즉시 저장
    final signUpData = Provider.of<SignUpData>(context, listen: false);
    signUpData.storeId = _selectedStoreId;

    // 디버깅 출력
    print('Debug - Store ID: ${signUpData.storeId}');
  }

  void _showStoreSelectionDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          title: Text('매장 선택'),
          content: Container(
            width: double.maxFinite,
            height: 150, // 리스트 높이 제한 (적절한 높이로 조정)
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: _storeList.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(_storeList[index]['name']),
                  onTap: () {
                    _onStoreSelected(_storeList[index]); // 첫 번째 명령문
                    Navigator.pop(context); // 다이얼로그를 닫음
                  },
                );
              },
            ),
          ),
        );
      },
    );
  }

  void _onNextButtonPressed() {
    if (_formKey.currentState!.validate()) {
      // Provider를 사용하여 SignUpData에 접근
      final signUpData = Provider.of<SignUpData>(context, listen: false);

      // 입력 데이터를 SignUpData에 저장
      signUpData.setStep1(
        widget.isGuard ? _storeNameController.text : null, // 매장명 저장 (경비원일 경우에만)
        _nickController.text, // 닉네임 저장
        _emailController.text, // 이메일 저장
      );

      // 매장 ID도 함께 저장 (필요할 경우)
      signUpData.storeId = _selectedStoreId;

      // 다음 화면으로 이동
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => SignUpStep2()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
        title: Text("회원가입"),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 매장명 입력 필드 (경비원인 경우에만 보이게)
              if (widget.isGuard) ...[
                GestureDetector(
                  onTap: _showStoreSelectionDialog, // 다이얼로그 표시 메서드 호출
                  child: AbsorbPointer(
                    child: TextFormField(
                      controller: _storeNameController,
                      decoration: InputDecoration(
                        labelText: '매장명',
                        suffixIcon: Icon(Icons.arrow_drop_down),
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 16),
              ],
              // 닉네임 입력 필드 (특수문자 제한)
              TextFormField(
                controller: _nickController, // controller 이름 변경
                decoration: InputDecoration(labelText: '닉네임'),
              ),
              SizedBox(height: 16),
              // 이메일 입력 필드 (형식 검사, 빈 값 검사, 공백 문자 제한)
              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(labelText: '이메일'),
              ),
              Spacer(),
              Container(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF0F148D),
                  ),
                  onPressed: _onNextButtonPressed,
                  child: Text(
                    '다음',
                    style: TextStyle(fontSize: 18, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}