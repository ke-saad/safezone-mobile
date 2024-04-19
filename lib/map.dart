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
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FlutterMap(
        options: MapOptions(
          center:
              LatLng(51.509364, -0.128928), // Coordonnées pour centrer la carte
          zoom: 13.0, // Zoom initial
        ),

        // Ajoutez d'autres layers si nécessaire
        children: [
          TileLayer(
            urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            subdomains: ['a', 'b', 'c'],
            userAgentPackageName: 'com.yourdomain.app',
          )
        ],
      ),
    );
  }
}
