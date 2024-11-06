import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:kakao_map_plugin/kakao_map_plugin.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'dart:typed_data';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

class Location extends StatefulWidget {
  const Location({super.key});

  @override
  State<Location> createState() => _LocationState();
}

class _LocationState extends State<Location> {
  late KakaoMapController mapController;
  String BaseUrl = dotenv.get("BASE_URL");
  Set<Marker> markers = {};
  List<Circle> circles = [];
  List<CustomOverlay> customOverlays = [];
  String selectedOverlayId = ''; // 선택된 오버레이 ID 저장
  LatLng? currentLocation;
  List data = [];
  List data1 = [];
  bool showPolice = false; // 경찰서 표시 여부
  bool showHospital = false; // 병원 표시 여부
  bool showNife = false; // 흉기 표시 여부

  @override
  void initState() {
    super.initState();
    fetchData();
    fetchData1();
    _determinePosition();
  }

  Future<String> getBase64Image(String imagePath) async {
    ByteData imageData = await rootBundle.load(imagePath);
    Uint8List bytes = imageData.buffer.asUint8List();
    String base64Image = base64Encode(bytes);
    return 'data:image/png;base64,$base64Image';
  }

  fetchData() async {
    final response = await http.get(Uri.parse('$BaseUrl/Map'));
    if (response.statusCode == 200) {
      setState(() {
        data = json.decode(response.body);
        print("Fetched data: $data");
        _addMarkers();
      });
    } else {
      print('데이터 요청 실패: ${response.statusCode}');
      throw Exception('데이터를 불러오는 데 실패했습니다.');
    }
  }

  fetchData1() async {
    final response = await http.get(Uri.parse('$BaseUrl/Map/app/alim'));
    if (response.statusCode == 200) {
      setState(() {
        data1 = json.decode(response.body);
        print("Fetched data: $data1");
        _filterMarkersByDistance(); // 초기 마커 필터링
      });
    } else {
      print('데이터 요청 실패: ${response.statusCode}');
      throw Exception('데이터를 불러오는 데 실패했습니다.');
    }
  }

  void _addMarkers() async {
    for (var facility in data) {
      double latitude = double.tryParse(facility['latitude'].toString()) ?? 0.0;
      double longitude =
          double.tryParse(facility['longitude'].toString()) ?? 0.0;
      LatLng position = LatLng(latitude, longitude);
      String markerId = UniqueKey().toString();
      String markerImage = facility['type'] == 'police'
          ? await getBase64Image('images/police.png')
          : await getBase64Image('images/hospital.png');
      markers.add(Marker(
        markerId: markerId,
        latLng: position,
        width: 40,
        height: 44,
        offsetX: 15,
        offsetY: 24,
        markerImageSrc: markerImage,
      ));
      customOverlays.add(CustomOverlay(
        customOverlayId: markerId,
        latLng: position,
        content:
            '<div style="background-color: rgba(0, 0, 0, 0.8); border-radius: 10px; padding: 10px; width: 200px;">'
            '<p style="color: white; font-size: 16px; font-weight: bold; margin: 0; text-align: center;">${facility['name']}</p>'
            '<p style="color: #f1c40f; margin: 5px 0; text-align: center; font-size: 14px;">${facility['type']}</p>'
            '<div style="border-top: 1px solid #f1c40f; margin-top: 5px;"></div>'
            '<p style="color: white; font-size: 12px; margin: 5px 0; text-align: center;">주소 : ${facility['address']}</p>'
            '<p style="color: white; font-size: 12px; margin: 5px 0; text-align: center;">전화번호 : ${facility['phone_number']}</p>'
            '</div>',
        yAnchor: 1.4,
        zIndex: 5,
      ));
    }
    setState(() {});
  }

  void _showAlertDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('알림'),
          content: Text('2km 내에 흉기 감지가 없습니다.'),
          actions: <Widget>[
            TextButton(
              child: Text('확인'),
              onPressed: () {
                Navigator.of(context).pop(); // 다이얼로그 닫기
              },
            ),
          ],
        );
      },
    );
  }


// 흉기 마커 필터링 함수 (2km 이내)
  void _filterMarkersByDistance() async {
    Set<Marker> filteredMarkers = {};
    List<CustomOverlay> filteredOverlays = [];

    if (currentLocation != null) {
      for (var facility in data1) {
        double latitude =
            double.tryParse(facility['latitude'].toString()) ?? 0.0;
        double longitude =
            double.tryParse(facility['longitude'].toString()) ?? 0.0;
        LatLng position = LatLng(latitude, longitude);

        // 현재 위치와 마커 위치 간의 거리 계산 (미터 단위)
        double distanceInMeters = Geolocator.distanceBetween(
          currentLocation!.latitude,
          currentLocation!.longitude,
          latitude,
          longitude,
        );

        // 거리 필터링 (2km 이내)
        if (distanceInMeters <= 2000) {
          String markerId = UniqueKey().toString();
          String markerImage = await getBase64Image('images/knigeicon2.png');

          filteredMarkers.add(Marker(
            markerId: markerId,
            latLng: position,
            width: 40,
            height: 44,
            offsetX: 15,
            offsetY: 24,
            markerImageSrc: markerImage,
          ));

          filteredOverlays.add(CustomOverlay(
              customOverlayId: markerId,
              latLng: position,
              content:
                  '<div style="background-color: rgba(0,0,0,0.8); border-radius:10px;padding :10px;width :200px;">'
                  '<p style="color:white;font-size :16px;font-weight:bold;margin :0;text-align:center;">흉기감지</p>'
                  '<p style="color:#f1c40f;margin :5px;text-align:center;font-size :14px;">${facility['store_name']}</p>'
                  '<div style="border-top :1px solid #f1c40f;margin-top :5px;"></div>'
                  '<p style="color:white;font-size :12px;margin-top :5px;text-align:center;">감지시간:${facility['detection_time']}</p></div>',
              yAnchor: 1.4,
              zIndex: 5));
        }
      }
      setState(() {
        markers = filteredMarkers;
        customOverlays = filteredOverlays;
      });
      if (filteredMarkers.isEmpty) {
        _showAlertDialog(context); // AlertDialog 호출
      }
    }
  }

// 경찰서와 병원 마커 필터링 함수 추가
  void _filterMarkers(String type) async {
    Set<Marker> filteredMarkers = {};
    List<CustomOverlay> filteredOverlays = [];

    for (var facility in data) {
      if (facility['type'] == type) {
        // type에 따라 필터링
        double latitude =
            double.tryParse(facility['latitude'].toString()) ?? 0.0;
        double longitude =
            double.tryParse(facility['longitude'].toString()) ?? 0.0;
        LatLng position = LatLng(latitude, longitude);

        String markerId = UniqueKey().toString();
        String markerImage = type == 'police'
            ? await getBase64Image('images/police.png')
            : await getBase64Image('images/hospital.png');

        filteredMarkers.add(Marker(
          markerId: markerId,
          latLng: position,
          width: 40,
          height: 44,
          offsetX: 15,
          offsetY: 24,
          markerImageSrc: markerImage,
        ));

        filteredOverlays.add(CustomOverlay(
            customOverlayId: markerId,
            latLng: position,
            content:
                '<div style="background-color :rgba(0 ,0 ,0 ,0.8);border-radius :.10 px;padding :.10 px;width :.200 px;">'
                '<p style ="color:white;font-size :.16 px;font-weight:bold;margin :.text-align:center;">${facility['name']} </p>'
                '<p style ="color:#f1c40f ;margin :.5 px;text-align:center;font-size :.14 px;">${facility['type']} </ p>'
                '<div style ="border-top :.1 pxsolid # f1c40f ;margin-top :.5 px;">'
                '</div>'
                '<p style ="color:white;font-size :12 px;margin-top :.5 px;text-align:center;">주소:${facility['address']} </p>'
                '</div>',
            yAnchor: 1.4,
            zIndex: 5));
      }
    }

    setState(() {
      markers = filteredMarkers;
      customOverlays = filteredOverlays;
    });
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('위치 서비스가 비활성화되어 있습니다.');
    }
    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied) {
      return Future.error('위치 권한이 거부되었습니다.');
    }
    if (permission == LocationPermission.deniedForever) {
      return Future.error('위치 권한이 영구적으로 거부되었습니다.');
    }
    Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
    setState(() {
      currentLocation = LatLng(position.latitude, position.longitude);
      mapController.panTo(currentLocation!);
      circles.add(Circle(
          circleId: 'current_location_circle',
          center: currentLocation!,
          radius: 5,
          strokeColor: Colors.red,
          strokeStyle: StrokeStyle.solid,
          strokeWidth: 10,
          fillColor: Colors.red.withOpacity(0.3),
          fillOpacity: 0.3,
          zIndex: 5,
          strokeOpacity: 1));
      circles.add(Circle(
          circleId: 'current_location_range',
          center: currentLocation!,
          radius: 2000,
          strokeColor: Colors.green,
          strokeStyle: StrokeStyle.solid,
          strokeWidth: 5,
          fillColor: Colors.green.withOpacity(0.4),
          fillOpacity: 0.4,
          zIndex: 5,
          strokeOpacity: 1));
    });
  }

  @override
  Widget build(BuildContext context) {
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
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Container(
        child: Stack(
          children: [
            Container(
              width: MediaQuery.of(context).size.width,
              height: MediaQuery.of(context).size.height,
              child: KakaoMap(
                onMapCreated: (KakaoMapController controller) {
                  mapController = controller;
                  if (currentLocation != null) {
                    mapController.panTo(currentLocation!);
                  }
                },
                markers: markers.toList(),
                circles: circles,
                customOverlays: customOverlays
                    .where((overlay) =>
                        overlay.customOverlayId == selectedOverlayId)
                    .toList(),
                onMarkerTap: (markerId, latLng, zoomLevel) {
                  setState(() {
                    selectedOverlayId =
                        (selectedOverlayId == markerId) ? '' : markerId;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('마커 클릭됨:\n\n$latLng')));
                },
              ),
            ),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                children: [
                  MaterialButton(
                    onPressed: () {
                      mapController.panTo(
                          currentLocation ?? LatLng(35.1465533, 126.9222613));
                    },
                    color: Colors.blue,
                    textColor: Colors.white,
                    child: Text('내 위치'),
                  ),
                  MaterialButton(
                    onPressed: () {
                      setState(() {
                        showPolice = true;
                        showHospital = false;
                        showNife = false;
                        _filterMarkers('police');
                      });
                    },
                    color: (showPolice ? Colors.green : Colors.grey),
                    textColor: Colors.white,
                    child: Text('경찰서'),
                  ),
                  MaterialButton(
                    onPressed: () {
                      setState(() {
                        showPolice = false;
                        showHospital = true;
                        showNife = false;
                        _filterMarkers('hospital');
                      });
                    },
                    color: (showHospital ? Colors.green : Colors.grey),
                    textColor: Colors.white,
                    child: Text('병원'),
                  ),
                  MaterialButton(
                    onPressed: () {
                      setState(() {
                        _filterMarkersByDistance();
                        showPolice = false;
                        showHospital = false;
                        showNife = true;
                      });
                    },
                    color: (showNife ? Colors.green : Colors.grey),
                    textColor: Colors.white,
                    child: Text('흉기'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
