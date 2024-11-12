import 'package:flutter/material.dart';

class SignUpData extends ChangeNotifier {
  String? storeName;
  int? storeId; // storeId 필드 추가
  String? nick;
  String? email;
  String? username;
  String? password;
  String? name;
  String? gender;
  String? birthdate;
  String? role; // "guard" 또는 "user"를 저장하는 필드

  // 가입 유형 설정 메소드
  void setUserType(bool isGuard) {
    role = isGuard ? "guard" : "user";
    notifyListeners();
  }

  void setStep1(String? storeName, String nickname, String email, [int? storeId]) {
    // 경비원일 경우에만 storeName을 저장
    if (role == "guard") {
      this.storeName = storeName;
      this.storeId = storeId; // storeId 저장
    }
    this.nick = nickname; // 닉네임 저장
    this.email = email; // 이메일 저장

    // 이메일, 닉네임, 매장명, storeId를 로그로 출력
    print("Step 1 - Nickname: $nickname, Email: $email, Store Name: $storeName, Store ID: $storeId");

    notifyListeners(); // 데이터가 변경되었음을 알림
  }

  void setStep2(String username, String password) {
    this.username = username;
    this.password = password;
    notifyListeners();
  }

  void setStep3(String name, String gender, String birthdate) {
    this.name = name;
    this.gender = gender;
    this.birthdate = birthdate;
    notifyListeners();
  }

  bool get isComplete =>
      (role == "user" || (role == "guard" && storeName != null)) &&
          nick != null &&
          email != null &&
          username != null &&
          password != null &&
          name != null &&
          gender != null &&
          birthdate != null;
}
