/*import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import 'dart:convert' as convert;

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final String apiKey = "BkQNUBMG6QVzesXvoZKXeHt77rK1O1Wq";
  final List<Marker> markers = [];

  @override
  void initState() {
    super.initState();
    final tomtomHQ = LatLng(52.376372, 4.908066);
    final initialMarker = Marker(
      width: 50.0,
      height: 50.0,
      point: tomtomHQ,
      child: Container(
        child: const Icon(Icons.location_on, size: 60.0, color: Colors.red),
      ),
    );
    markers.add(initialMarker);
  }

  Future<void> getAddresses(String value, double lat, double lon) async {
    final queryParameters = {
      'key': apiKey,
      'lat': '$lat',
      'lon': '$lon',
    };
    final uri = Uri.https(
        'api.tomtom.com', '/search/2/search/$value.json', queryParameters);
    final response = await http.get(uri);
    final jsonData = convert.jsonDecode(response.body);
    final results = jsonData['results'];
    List<Marker> newMarkers = [];
    for (var element in results) {
      var position = element['position'];
      var marker = Marker(
          point: LatLng(position['lat'], position['lon']),
          width: 50.0,
          height: 50.0,
          child: Container(
            child: const Icon(Icons.location_on, size: 60.0, color: Colors.red),
          ));
      newMarkers.add(marker);
    }
    setState(() {
      markers.addAll(newMarkers);
    });
  }

  @override
  Widget build(BuildContext context) {
    final tomtomHQ = LatLng(52.376372, 4.908066);

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: "TomTom Map",
      home: Scaffold(
        resizeToAvoidBottomInset: false,
        body: Center(
          child: Stack(
            children: <Widget>[
              FlutterMap(
                options: MapOptions(center: tomtomHQ, zoom: 13.0),
                children: [
                  /*layers: [
                    new*/
                  TileLayer(
                    urlTemplate: "https://api.tomtom.com/map/1/tile/basic/main/"
                        "{z}/{x}/{y}.png?key={apiKey}",
                    additionalOptions: {"apiKey": apiKey},
                  ),
                  MarkerLayer(
                    markers: markers,
                  ),
                ],
                //],
              ),

              Container(
                padding: EdgeInsets.all(20),
                alignment: Alignment.bottomLeft,
                /* child: Image.asset(
                      "assets/images/tt_logo.png")*/
              ), // Corrected asset path
              /*Container(
                  padding: EdgeInsets.all(30),
                  alignment: Alignment.topRight,
                  child: TextField(
                    onSubmitted: (value) {
                      getAddresses(
                          value, tomtomHQ.latitude, tomtomHQ.longitude);
                    },
                  ))*/
                  floatingActionButton: FloatingActionButton(
          child: Icon(Icons.copyright),
          onPressed: () async {
            http.Response response = await getCopyrightsJSONResponse()});
            ],
          ),
        ),
      ),
    );
  }

  Future<http.Response> getCopyrightsJSONResponse() async {
    var url = "https://api.tomtom.com/map/1/copyrights.json?key=$apiKey";
    var response = await http.get(url as Uri);
    return response;
  }
}*/
import "package:flutter/material.dart";
import "package:flutter_map/flutter_map.dart";
import "package:http/http.dart" as http;
import "package:latlong2/latlong.dart";
import "dart:convert" as convert;
import "package:safezone/copyrightfile.dart";

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  final String apiKey = "BkQNUBMG6QVzesXvoZKXeHt77rK1O1Wq";
  final List<Marker> markers = List.empty(growable: true);

  @override
  Widget build(BuildContext context) {
    final tomtomHQ = new LatLng(32.0, -6.0);

    final initialMarker = Marker(
      width: 50.0, // Marker width
      height: 50.0, // Marker height
      point: tomtomHQ, // Assuming 'tomtomHQ' is defined elsewhere as a LatLng
      child: IconButton(
        onPressed: () {},
        icon: Icon(Icons.location_on),
        color: Colors.red,
        iconSize: 45,
      ),
    );

    markers.add(initialMarker);
    getAddresses(value, lat, lon) async {
      final Map<String, String> queryParameters = {'key': '$apiKey'};
      queryParameters['lat'] = '$lat';
      queryParameters['lon'] = '$lon';
      var response = await http.get(Uri.https(
          'api.tomtom.com', '/search/2/batch/$value.json', queryParameters));
      var jsonData = convert.jsonDecode(response.body);
      print('$jsonData');
      var results = jsonData['results'];
      for (var element in results) {
        var position = element['position'];
        var marker = Marker(
          point: new LatLng(position['lat'], position['lon']),
          width: 50.0,
          height: 50.0,
          child: IconButton(
            onPressed: () {},
            icon: Icon(Icons.location_on),
            color: Colors.blue,
            iconSize: 45,
          ),
        );
        markers.add(marker);
      }
    }

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: Center(
            child: Stack(
          children: <Widget>[
            FlutterMap(
              options: MapOptions(center: tomtomHQ, zoom: 13.0),
              children: [
                TileLayer(
                  urlTemplate:
                      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                  additionalOptions: {"apiKey": apiKey},
                  //subdomains: ['a', 'b', 'c'],
                  userAgentPackageName: 'sanaa.com',
                ),
                MarkerLayer(
                  markers: markers,
                  /*markers: [
                    Marker(
                      point: LatLng(32.0, -6.0),
                      width: 80,
                      height: 80,
                      child: IconButton(
                        onPressed: () {},
                        icon: Icon(Icons.location_on),
                        color: Colors.green,
                        iconSize: 45,
                      ),
                    ),
                  ],*/
                ),
              ],
            ),
            Container(
                padding: EdgeInsets.all(30),
                alignment: Alignment.topRight,
                child: TextField(
                  onSubmitted: (value) {
                    print('$value');
                    getAddresses(value, tomtomHQ.latitude, tomtomHQ.longitude);
                  },
                ))
          ],
        )),
        floatingActionButton: FloatingActionButton(
          child: Icon(Icons.copyright),
          onPressed: () async {
            http.Response response = await getCopyrightsJSONResponse();
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => CopyrightsPage(
                          copyrightsText: parseCopyrightsResponse(response),
                        )));
          },
        ),
      ),
    );
  }

  Future<http.Response> getCopyrightsJSONResponse() async {
    var url = "https://api.tomtom.com/map/1/copyrights.json?key=$apiKey";
    var response = await http.get(url as Uri);
    return response;
  }

  String parseCopyrightsResponse(http.Response response) {
    if (response.statusCode == 200) {
      StringBuffer stringBuffer = StringBuffer();
      var jsonResponse = convert.jsonDecode(response.body);
      parseGeneralCopyrights(jsonResponse, stringBuffer);
      parseRegionsCopyrights(jsonResponse, stringBuffer);
      return stringBuffer.toString();
    }
    return "Can't get copyrights";
  }

  void parseRegionsCopyrights(jsonResponse, StringBuffer sb) {
    List<dynamic> copyrightsRegions = jsonResponse["regions"];
    copyrightsRegions.forEach((element) {
      sb.writeln(element["country"]["label"]);
      List<dynamic> cpy = element["copyrights"];
      cpy.forEach((e) {
        sb.writeln(e);
      });
      sb.writeln("");
    });
  }

  void parseGeneralCopyrights(jsonResponse, StringBuffer sb) {
    List<dynamic> generalCopyrights = jsonResponse["generalCopyrights"];
    generalCopyrights.forEach((element) {
      sb.writeln(element);
      sb.writeln("");
    });
    sb.writeln("");
  }
}
