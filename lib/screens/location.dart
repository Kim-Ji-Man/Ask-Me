import 'package:flutter/material.dart';
import 'package:kakao_map_plugin/kakao_map_plugin.dart';
import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

class Location extends StatefulWidget {
  const Location({super.key});

  @override
  State<Location> createState() => _LocationState();
}

class _LocationState extends State<Location> {
  late KakaoMapController mapController;
  Set<Marker> markers = {};
  List<Circle> circles = [];
  List<CustomOverlay> customOverlays = [];
  String selectedOverlayId = ''; // 선택된 오버레이 ID 저장
  LatLng? currentLocation;
  List data = [];
  bool showPolice = false; // 경찰서 표시 여부
  bool showHospital = false; // 병원 표시 여부
  bool showAll = false; // 전체 표시 여부

  @override
  void initState() {
    super.initState();
    fetchData();
    _determinePosition();
  }

  fetchData() async {
    final response = await http.get(Uri.parse('http://192.168.70.166:5000/Map'));
    if (response.statusCode == 200) {
      setState(() {
        data = json.decode(response.body);
        print("Fetched data: $data"); // Fetch된 데이터 확인
        _addMarkers();
      });
    } else {
      print('데이터 요청 실패: ${response.statusCode}');
      throw Exception('데이터를 불러오는 데 실패했습니다.');
    }
  }

  void _addMarkers() {
    for (var facility in data) {
      double latitude = double.tryParse(facility['latitude'].toString()) ?? 0.0;
      double longitude = double.tryParse(facility['longitude'].toString()) ?? 0.0;

      LatLng position = LatLng(latitude, longitude);
      String markerId = UniqueKey().toString();
      markers.add(Marker(
        markerId: markerId,
        latLng: position,
        width: 40,
        height: 44,
        offsetX: 15,
        offsetY: 24,
        markerImageSrc: facility['type'] == 'police'
            ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
            : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png',
      ));

      customOverlays.add(CustomOverlay(
        customOverlayId: markerId, // 마커 ID와 오버레이 ID를 맞춤
        latLng: position,
        content: '<div style="background-color: rgba(0, 0, 0, 0.8); border-radius: 10px; padding: 10px; width: 200px;">'
            '  <p style="color: white; font-size: 16px; font-weight: bold; margin: 0; text-align: center;">${facility['name']}</p>'
            '<p style="color: #f1c40f; margin: 5px 0; text-align: center; font-size: 14px;">${facility['type']}</p>'
            ' <div style="border-top: 1px solid #f1c40f; margin-top: 5px;"></div>'
            ' <p style="color: white; font-size: 12px; margin: 5px 0; text-align: center;">주소: ${facility['address']}</p>'
            '<p style="color: white; font-size: 12px; margin: 5px 0; text-align: center;">전화번호 : ${facility['phone_number']}</p>'
            '</div>',
        yAnchor: 1.4,
        zIndex: 5,
      ));
      print("Added marker at: $position"); // 추가된 마커 확인
    }
    setState(() {}); // 마커 추가 후 UI 업데이트
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied.');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return Future.error('Location permissions are permanently denied.');
    }

    Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
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
        strokeOpacity: 1,
      ));

      circles.add(Circle(
        circleId: 'current_location_range',
        center: currentLocation!,
        radius: 3000,
        strokeColor: Colors.green,
        strokeStyle: StrokeStyle.solid,
        strokeWidth: 5,
        fillColor: Colors.green.withOpacity(0.4),
        fillOpacity: 0.4,
        zIndex: 5,
        strokeOpacity: 1,
      ));
    });
  }

  void _filterMarkers(String? type) {
    Set<Marker> filteredMarkers = {};
    List<CustomOverlay> filteredOverlays = []; // 필터링된 오버레이를 저장하는 리스트

    if (type == null || type == 'all') {
      for (var facility in data) {
        double latitude = double.tryParse(facility['latitude'].toString()) ?? 0.0;
        double longitude = double.tryParse(facility['longitude'].toString()) ?? 0.0;

        LatLng position = LatLng(latitude, longitude);
        String markerId = UniqueKey().toString();
        filteredMarkers.add(Marker(
          markerId: markerId,
          latLng: position,
          width: 40,
          height: 44,
          offsetX: 15,
          offsetY: 24,
          markerImageSrc: facility['type'] == 'police'
              ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
              : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png',
        ));

        filteredOverlays.add(CustomOverlay(
          customOverlayId: markerId, // 마커 ID와 오버레이 ID를 맞춤
          latLng: position,
          content: '<div style="background-color: rgba(0, 0, 0, 0.8); border-radius: 10px; padding: 10px; width: 200px;">'
              '  <p style="color: white; font-size: 16px; font-weight: bold; margin: 0; text-align: center;">${facility['name']}</p>'
              '<p style="color: #f1c40f; margin: 5px 0; text-align: center; font-size: 14px;">${facility['type']}</p>'
              ' <div style="border-top: 1px solid #f1c40f; margin-top: 5px;"></div>'
              ' <p style="color: white; font-size: 12px; margin: 5px 0; text-align: center;">주소: ${facility['address']}</p>'
              '<p style="color: white; font-size: 12px; margin: 5px 0; text-align: center;">전화번호 : ${facility['phone_number']}</p>'
              '</div>',
          yAnchor: 1.4,
          zIndex: 5,
        ));
      }
    } else {
      for (var facility in data) {
        if (facility['type'] == type) {
          double latitude = double.tryParse(facility['latitude'].toString()) ?? 0.0;
          double longitude = double.tryParse(facility['longitude'].toString()) ?? 0.0;

          LatLng position = LatLng(latitude, longitude);
          String markerId = UniqueKey().toString();
          filteredMarkers.add(Marker(
            markerId: markerId,
            latLng: position,
            width: 40,
            height: 44,
            offsetX: 15,
            offsetY: 24,
            markerImageSrc: type == 'police'
                ? 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png'
                : 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png',
          ));

          filteredOverlays.add(CustomOverlay(
            customOverlayId: markerId, // 마커 ID와 오버레이 ID를 맞춤
            latLng: position,
            content: '<div style="background-color: rgba(0, 0, 0, 0.8); border-radius: 10px; padding: 10px; width: 200px;">'
                '  <p style="color: white; font-size: 16px; font-weight: bold; margin: 0; text-align: center;">${facility['name']}</p>'
                '<p style="color: #f1c40f; margin: 5px 0; text-align: center; font-size: 14px;">${facility['type']}</p>'
                ' <div style="border-top: 1px solid #f1c40f; margin-top: 5px;"></div>'
                ' <p style="color: white; font-size: 12px; margin: 5px 0; text-align: center;">주소: ${facility['address']}</p>'
                '<p style="color: white; font-size: 12px; margin: 5px 0; text-align: center;">전화번호 : ${facility['phone_number']}</p>'
                '</div>',
            yAnchor: 1.4,
            zIndex: 5,
          ));
        }
      }
    }

    setState(() {
      markers = filteredMarkers;
      customOverlays = filteredOverlays; // 필터링된 오버레이로 업데이트
      selectedOverlayId = ''; // 카테고리 변경 시 오버레이 초기화
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
        child: Stack(children: [
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
                  .where((overlay) => overlay.customOverlayId == selectedOverlayId)
                  .toList(), // 선택된 오버레이만 표시
              onMarkerTap: (markerId, latLng, zoomLevel) {
                setState(() {
                  // 클릭된 마커가 이미 선택된 경우에는 오버레이를 비활성화하고, 아니면 표시
                  selectedOverlayId = (selectedOverlayId == markerId) ? '' : markerId;
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('마커 클릭됨:\n\n$latLng')),
                );
              },
            ),
          ),
          // 버튼들
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.symmetric(horizontal: 8),
            child: Row(
              children: [
                MaterialButton(
                  onPressed: () {
                    mapController.panTo(currentLocation ?? LatLng(35.1465533, 126.9222613));
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
                      showAll = false;
                      _filterMarkers('police'); // 경찰서만 필터링
                    });
                  },
                  color: showPolice ? Colors.green : Colors.grey,
                  textColor: Colors.white,
                  child: Text('경찰서'),
                ),
                MaterialButton(
                  onPressed: () {
                    setState(() {
                      showPolice = false;
                      showHospital = true;
                      showAll = false;
                      _filterMarkers('hospital'); // 병원만 필터링
                    });
                  },
                  color: showHospital ? Colors.green : Colors.grey,
                  textColor: Colors.white,
                  child: Text('병원'),
                ),
                MaterialButton(
                  onPressed: () {
                    setState(() {
                      showPolice = false;
                      showHospital = false;
                      showAll = true;
                      _filterMarkers('all'); // 모든 마커 표시
                    });
                  },
                  color: showAll ? Colors.green : Colors.grey,
                  textColor: Colors.white,
                  child: Text('전체'),
                ),
              ],
            ),
          ),
        ]),
      ),
    );
  }
}
