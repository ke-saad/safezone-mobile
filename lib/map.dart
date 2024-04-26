import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class Mapage extends StatefulWidget {
  const Mapage({Key? key})
      : super(
            key: key); // Pour la sécurité null, utilisez Key? et non super.key

  @override
  State<Mapage> createState() => _MapState();
}

class _MapState extends State<Mapage> {
  LatLng point = LatLng(49.5, -0.09);
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FlutterMap(
        options: MapOptions(
          center: LatLng(32.0, -6.0),
          zoom: 7.2,
          onTap: (tapPosition, point) {
            setState(() {
              point = point;
            });
          },
        ),

        // Ajoutez d'autres layers si nécessaire
        children: [
          TileLayer(
            urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            subdomains: ['a', 'b', 'c'],
            userAgentPackageName: 'com.example.app',
          ),
          MarkerLayer(
            markers: [
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
            ],
          ),
          MarkerLayer(
            markers: [
              Marker(
                point: LatLng(39.0, -4.0),
                width: 80,
                height: 80,
                child: IconButton(
                  onPressed: () {},
                  icon: Icon(Icons.location_on),
                  color: Colors.red,
                  iconSize: 45,
                ),
              ),
            ],
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Define the action when the button is pressed
        },
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
      // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}
