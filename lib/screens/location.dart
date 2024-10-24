import 'package:flutter/material.dart';
import 'package:kakao_map_plugin/kakao_map_plugin.dart';
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/services.dart' show rootBundle;
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

class Location extends StatefulWidget {
  const Location({super.key});

  @override
  State<Location> createState() => _LocationState();
}

class _LocationState extends State<Location> {
  late KakaoMapController mapController;
  List<CustomOverlay> customOverlays = [];
  Set<Marker> markers = {};
  List<Marker> marker = [];
  List<String> imagePaths = [
    'images/jam.jpg',
    'images/pa.jpg',
    'images/pi.jpg',
  ];
  List<Circle> circles = []; // 현재 위치에 표시할 원
  bool showOverlay = false; // 오버레이 표시 여부를 저장할 변수
  String selectedOverlayId = ''; // 선택된 오버레이 ID 저장
  LatLng? currentLocation; // 현재 위치 저장
  List data = [];

  @override
  void initState() {
    super.initState();
    fetchData();
    _determinePosition(); // 앱 시작 시 위치 가져오기
  }

  fetchData() async {
    final response = await http.get(Uri.parse('http://192.168.70.166:5000/Map'));
    if (response.statusCode == 200) {
      setState(() {
        data = json.decode(response.body);
      });
    } else {
      print('데이터 요청 실패: ${response.statusCode}'); // 실패 시 로그 출력
      throw Exception('데이터를 불러오는 데 실패했습니다.');
    }
  }





  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    // 위치 서비스 활성화 확인
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    // 위치 권한 확인
    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied.');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return Future.error(
          'Location permissions are permanently denied, we cannot request permissions.');
    }

    // 현재 위치 가져오기
    Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);

    setState(() {
      currentLocation = LatLng(position.latitude, position.longitude);
      // 지도 중심을 현재 위치로 이동
      mapController.panTo(currentLocation!);

      // 현재 위치에 빨간 마커 추가
      // markers.add(Marker(
      //   markerId: 'current_location_marker',
      //   latLng: currentLocation!,
      //   width: 40,
      //   height: 44,
      //   offsetX: 15,
      //   offsetY: 24,
      //   // markerImageSrc: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png', // 빨간색 마커 이미지
      // ));

      circles.add(Circle(
          circleId: 'current_location_circle',
          center: currentLocation!,
          radius: 5, // 반경 3km
          strokeColor: Colors.red,
          strokeStyle: StrokeStyle.solid,
          strokeWidth: 10,
          // fillColor: Colors.red.withOpacity(0.3),
          fillColor: Colors.red,
          fillOpacity: 1,
          zIndex: 5,
          strokeOpacity: 1
      ));

      // 현재 위치에 반경 3km의 빨간 원 추가
      circles.add(Circle(
        circleId: 'current_location_circle',
        center: currentLocation!,
        radius: 1500,
        strokeColor: Colors.green,
        strokeStyle: StrokeStyle.solid,
        strokeWidth: 5,
        // fillColor: Colors.red.withOpacity(0.3),
          fillColor: Colors.green,
          fillOpacity: 0.4,
        zIndex: 5,
        strokeOpacity: 1
      ));
    });
  }

  Future<String> getBase64Image(String imagePath) async {
    ByteData imageData = await rootBundle.load(imagePath);
    Uint8List bytes = imageData.buffer.asUint8List();
    String base64Image = base64Encode(bytes);
    return 'data:image/jpeg;base64,$base64Image';
  }

  @override
  Widget build(BuildContext context) {
    List<LatLng> locations = [
      LatLng(35.1465533, 126.9222613),
      LatLng(35.1500000, 126.9300000),
      LatLng(35.1550000, 126.9350000),
    ];
    List<String> titles = ["제목1", "제목2", "제목3"];
    List<String> conts = ["내용11", "내용22", "내용33"];
    List<String> botts = ["내용111", "내용222", "내용333"];

    var contentTemplate = (String title, String imagePath, String contents, String bottomcon) async {
      String base64Image = await getBase64Image(imagePath);
      return '<div style="background-color: red; border-radius: 8px; padding: 8px;">'
          '<img src="$base64Image" alt="이미지" width="200px" height="100px"/>'
          '<ul style="color: white; list-style: none;">'
          '<li>$title</li>'
          '<li>$contents</li>'
          '<li>$bottomcon</li>'
          '</ul>'
          '</div>';
    };

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Align(
          alignment: Alignment.centerLeft,
          child: Text(
            '지도',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
        ),
        backgroundColor: Colors.white, // AppBar 배경색 설정
        elevation: 0, // 그림자 제거
      ),
      body: Container(
        child: Stack(children: [
          Container(
            width: MediaQuery.of(context).size.width,
            height: MediaQuery.of(context).size.height,
            child: KakaoMap(
              onMapCreated: ((controller) async {
                mapController = controller;

                for (var i = 0; i < locations.length; i++) {
                  String imagePath = imagePaths[i];
                  String title = titles[i];
                  String cont = conts[i];
                  String bott = botts[i];

                  markers.add(Marker(
                    markerId: UniqueKey().toString(),
                    latLng: locations[i],
                    width: 40,
                    height: 44,
                    offsetX: 15,
                    offsetY: 24,
                    markerImageSrc: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
                  ));

                  String content = await contentTemplate(title, imagePath, cont, bott);
                  customOverlays.add(CustomOverlay(
                    customOverlayId: i.toString(),
                    latLng: locations[i],
                    content: content,
                    yAnchor: 1.2,
                    zIndex: 5,
                  ));
                }

                setState(() {});
              }),
              customOverlays: showOverlay
                  ? customOverlays
                  .where((overlay) => overlay.customOverlayId == selectedOverlayId)
                  .toList()
                  : [],
              markers: markers.toList(),
              circles: circles, // 현재 위치에 원 표시
              center: currentLocation ?? LatLng(35.1465533, 126.9222613), // 초기 중심을 현재 위치로 설정
              onMarkerTap: (markerId, latLng, zoomLevel) {
                setState(() {
                  showOverlay = true;
                  selectedOverlayId = markers.toList().indexWhere((m) => m.markerId == markerId).toString();
                });

                ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('마커 클릭됨:\n\n$latLng')));
              },
              onCustomOverlayTap: (customOverlayId, latLng) {
                if (customOverlayId == selectedOverlayId) {
                  setState(() {
                    showOverlay = false;
                  });
                }
              },
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              children: [
                MaterialButton(
                  onPressed: () => mapController.panTo(currentLocation ?? LatLng(35.1465533, 126.9222613)),
                  color: Colors.white,
                  child: const Text("현재 위치로 이동"),
                ),
              ],
            ),
          ),
        ]),
      ),
    );
  }
}
