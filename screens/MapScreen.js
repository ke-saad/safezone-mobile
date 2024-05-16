import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Button, Pressable } from 'react-native';
import MapView, { Callout, Marker, Polygon } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import * as turf from '@turf/helpers';
import convex from '@turf/convex';

const MapScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [safeMarkers, setSafeMarkers] = useState([]);
  const [dangerousMarkers, setDangerousMarkers] = useState([]);
  const [safeGeoJsonLayers, setSafeGeoJsonLayers] = useState([]);
  const [dangerousGeoJsonLayers, setDangerousGeoJsonLayers] = useState([]);
  const mapRef = useRef();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const fetchSafeZones = async () => {
    try {
      const response = await axios.get('http://192.168.0.195:3001/safezones');
      const safeZones = response.data;
      const safeMarkersFromZones = safeZones.reduce((acc, zone) => {
        return acc.concat(zone.markers.map(marker => ({
          position: marker.coordinates,
          _id: marker._id
        })));
      }, []);
      setSafeMarkers(existingMarkers => [...existingMarkers, ...safeMarkersFromZones]);

      const safeGeoJsonData = safeZones.map(zone => {
        const points = zone.markers.map(marker => turf.point([marker.coordinates[1], marker.coordinates[0]]));
        const featureCollection = turf.featureCollection(points);
        return convex(featureCollection);
      }).filter(Boolean);
      setSafeGeoJsonLayers(safeGeoJsonData);
    } catch (error) {
      console.error('Error fetching safe zones:', error);
    }
  };

  const fetchDangerousZones = async () => {
    try {
      const response = await axios.get('http://192.168.0.195:3001/dangerzones');
      const dangerousZones = response.data;
      const dangerousMarkersFromZones = dangerousZones.reduce((acc, zone) => {
        return acc.concat(zone.markers.map(marker => ({
          position: marker.coordinates,
          description: marker.description || 'No description provided',
          _id: marker._id
        })));
      }, []);
      setDangerousMarkers(existingMarkers => [...existingMarkers, ...dangerousMarkersFromZones]);

      const dangerousGeoJsonData = dangerousZones.map(zone => {
        const points = zone.markers.map(marker => turf.point([marker.coordinates[1], marker.coordinates[0]]));
        const featureCollection = turf.featureCollection(points);
        return convex(featureCollection);
      }).filter(Boolean);
      setDangerousGeoJsonLayers(dangerousGeoJsonData);
    } catch (error) {
      console.error('Error fetching dangerous zones:', error);
    }
  };

  useEffect(() => {
    fetchSafeZones();
    fetchDangerousZones();
  }, []);

  const animateToRegion = (latitude, longitude) => {
    let region = {
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: 0.0222,
      longitudeDelta: 0.0222,
    };
    mapRef.current.animateToRegion(region, 2000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder='Search...'
          textInputProps={{
            placeholderTextColor: 'grey',
          }}
          fetchDetails={true}
          autoFocus={true}
          GooglePlacesSearchQuery={{
            rankby: 'distance',
          }}
          onPress={(data, details = null) => {
            animateToRegion(details.geometry.location.lat, details.geometry.location.lng);
          }}
          query={{
            key: '#######################',
            language: 'en',
            components: 'country:uk',
          }}
          styles={{
            container: { flex: 1 },
            listView: { backgroundColor: 'white', borderRadius: 25 },
            poweredContainer: {
              display: 'none',
            },
          }}
        />
        <Button title="Logout" onPress={signOut} />
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 55.378051,
          longitude: -3.435973,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        showsCompass={false}
        loadingEnabled={true}
        showsUserLocation={true}
      >
        {safeMarkers.map((marker, index) => (
          <Marker
            key={`safe-${index}`}
            coordinate={{ latitude: marker.position[0], longitude: marker.position[1] }}
            pinColor='green'
            onCalloutPress={() => navigation.push('DetailsScreen', { paramA: marker._id })}
          >
            <Callout>
              <Text>Safe location</Text>
            </Callout>
          </Marker>
        ))}
        {dangerousMarkers.map((marker, index) => (
          <Marker
            key={`dangerous-${index}`}
            coordinate={{ latitude: marker.position[0], longitude: marker.position[1] }}
            pinColor='red'
            onCalloutPress={() => navigation.push('DetailsScreen', { paramA: marker._id })}
          >
            <Callout>
              <Text>{marker.description}</Text>
            </Callout>
          </Marker>
        ))}
        {safeGeoJsonLayers.map((layer, index) => (
          <Polygon
            key={`safe-layer-${index}`}
            coordinates={layer.geometry.coordinates[0].map(([longitude, latitude]) => ({ latitude, longitude }))}
            strokeColor='green'
            fillColor='rgba(0, 255, 0, 0.3)'
            strokeWidth={2}
          />
        ))}
        {dangerousGeoJsonLayers.map((layer, index) => (
          <Polygon
            key={`dangerous-layer-${index}`}
            coordinates={layer.geometry.coordinates[0].map(([longitude, latitude]) => ({ latitude, longitude }))}
            strokeColor='red'
            fillColor='rgba(255, 0, 0, 0.3)'
            strokeWidth={2}
          />
        ))}
      </MapView>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    zIndex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
