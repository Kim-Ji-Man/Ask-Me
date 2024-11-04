import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class MyInfoPage extends StatefulWidget {
  @override
  _MyInfoPageState createState() => _MyInfoPageState();
}

class _MyInfoPageState extends State<MyInfoPage> {
  final TextEditingController nicknameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController currentPasswordController = TextEditingController();
  final TextEditingController newPasswordController = TextEditingController();
  final TextEditingController confirmNewPasswordController = TextEditingController();

  String baseUrl = dotenv.get("BASE_URL");
  String userId = '';
  String username = '';
  String name = '';
  String selectedYear = '2000';
  String selectedMonth = '01';
  String selectedDay = '01';

  @override
  void initState() {
    super.initState();
    _fetchUserInfo();
  }

  Future<void> _fetchUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) {
      print('No token found');
      return;
    }

    final parts = token.split('.');
    if (parts.length != 3) {
      print('Invalid token format');
      throw Exception('Invalid token');
    }

    final payload = json.decode(
      utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
    );

    print('Full token payload: $payload');

    userId = payload['userId']?.toString() ?? '';
    if (userId.isEmpty) {
      print("Error: userId not found in token payload");
      return;
    }

    final url = Uri.parse('$baseUrl/mypage/info/$userId');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      setState(() {
        username = data['username'] ?? '';
        name = data['mem_name'] ?? '';
        nicknameController.text = data['nick'] ?? '';
        emailController.text = data['email'] ?? '';
        phoneController.text = data['phone_number'] ?? '';

        if (data['birth'] != null) {
          final birthStr = data['birth'].toString();
          final birthParts = [
            birthStr.substring(0, 2),
            birthStr.substring(2, 4),
            birthStr.substring(4, 6),
          ];
          selectedYear = '19${birthParts[0]}';
          selectedMonth = birthParts[1];
          selectedDay = birthParts[2];
        }
      });
    } else {
      print('Failed to load user info with status code: ${response.statusCode}');
      print('Response body: ${response.body}');
    }
  }

  String formatBirthDate() {
    return '${selectedYear.substring(2)}$selectedMonth$selectedDay';
  }

  Future<void> _updateProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) {
      print('Error: No token found');
      return;
    }

    final url = Uri.parse('$baseUrl/auth/update_app');
    final birth = formatBirthDate();

    print("Authorization Header: Bearer $token");
    print("Request URL: $url");
    print("Request Body: ${json.encode({
      'username': username,
      'name': name,
      'nick': nicknameController.text,
      'email': emailController.text,
      'phone_number': phoneController.text,
      'birth': birth,
    })}");

    final response = await http.put(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token'
      },
      body: json.encode({
        'username': username,
        'name': name,
        'nick': nicknameController.text,
        'email': emailController.text,
        'phone_number': phoneController.text,
        'birth': birth,
      }),
    );

    if (response.statusCode == 200) {
      print('Profile updated successfully');
    } else {
      print('Failed to update profile with status code: ${response.statusCode}');
      print('Response body: ${response.body}');
    }
  }

  Future<void> _updatePassword() async {
    if (newPasswordController.text != confirmNewPasswordController.text) {
      print("New passwords do not match.");
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) {
      print('Error: No token found');
      return;
    }

    final url = Uri.parse('$baseUrl/find/change-password');

    print("Authorization Header: Bearer $token");
    print("Password Change URL: $url");
    print("Password Change Request Body: ${json.encode({
      'username': username,
      'current_password': currentPasswordController.text,
      'new_password': newPasswordController.text,
      'confirm_new_password': confirmNewPasswordController.text,
    })}");

    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token'
      },
      body: json.encode({
        'username': username,
        'current_password': currentPasswordController.text,
        'new_password': newPasswordController.text,
        'confirm_new_password': confirmNewPasswordController.text,
      }),
    );

    if (response.statusCode == 200) {
      print('Password updated successfully');
    } else {
      print('Failed to update password with status code: ${response.statusCode}');
      print('Response body: ${response.body}');
    }
  }

  void _saveChanges() {
    if (newPasswordController.text.isNotEmpty || confirmNewPasswordController.text.isNotEmpty) {
      _updatePassword();
    } else {
      _updateProfile();
    }
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
        title: Text('개인정보 관리', style: TextStyle(color: Colors.black)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: ListView(
          children: [
            SizedBox(height: 20),
            _buildInfoRow('아이디', username),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildInfoRow('이름', name),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildEditableField('닉네임', nicknameController),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            Text('생년월일', style: TextStyle(fontSize: 14, color: Colors.grey)),
            _buildBirthdateRow(),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildEditableField('휴대폰 번호', phoneController),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildEditableField('이메일', emailController),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildEditableField('현재 비밀번호', currentPasswordController),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildEditableField('새 비밀번호', newPasswordController),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 20),
            _buildEditableField('새 비밀번호 확인', confirmNewPasswordController),
            Divider(color: Colors.grey[300]),
            SizedBox(height: 40),
            ElevatedButton(
              onPressed: _saveChanges,
              child: Text('수정 완료'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 15),
                backgroundColor: Colors.blue[500],
                foregroundColor: Colors.black,
              ),
            ),
            SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildBirthdateRow() {
    return Row(
      children: [
        Expanded(
          child: DropdownButtonFormField<String>(
            value: selectedYear,
            items: List.generate(100, (index) {
              return DropdownMenuItem(
                value: (1920 + index).toString(),
                child: Text((1920 + index).toString()),
              );
            }),
            onChanged: (value) {
              setState(() {
                selectedYear = value!;
              });
            },
            decoration: InputDecoration(
              contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(5.0),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
            ),
          ),
        ),
        SizedBox(width: 10),
        Expanded(
          child: DropdownButtonFormField<String>(
            value: selectedMonth,
            items: List.generate(12, (index) {
              return DropdownMenuItem(
                value: (index + 1).toString().padLeft(2, '0'),
                child: Text((index + 1).toString().padLeft(2, '0')),
              );
            }),
            onChanged: (value) {
              setState(() {
                selectedMonth = value!;
              });
            },
            decoration: InputDecoration(
              contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(5.0),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
            ),
          ),
        ),
        SizedBox(width: 10),
        Expanded(
          child: DropdownButtonFormField<String>(
            value: selectedDay,
            items: List.generate(31, (index) {
              return DropdownMenuItem(
                value: (index + 1).toString().padLeft(2, '0'),
                child: Text((index + 1).toString().padLeft(2, '0')),
              );
            }),
            onChanged: (value) {
              setState(() {
                selectedDay = value!;
              });
            },
            decoration: InputDecoration(
              contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(5.0),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 14, color: Colors.grey)),
        SizedBox(height: 8),
        Text(value, style: TextStyle(fontSize: 16, color: Colors.black)),
      ],
    );
  }

  Widget _buildEditableField(String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 14, color: Colors.grey)),
        SizedBox(height: 8),
        TextFormField(
          controller: controller,
          textAlign: TextAlign.start,
          decoration: InputDecoration(
            hintText: '입력하세요',
            contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(5.0),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
          ),
        ),
      ],
    );
  }
}
