import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Pressable, Alert, TextInput } from 'react-native';
import MapView, { Callout, Marker, Polygon, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import * as turf from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import convex from '@turf/convex';
import Modal from 'react-native-modal';
import polyline from '@mapbox/polyline';

const MapScreen = ({ navigation }) => {
  const { signOut, userToken } = useAuth();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [safeMarkers, setSafeMarkers] = useState([]);
  const [dangerousMarkers, setDangerousMarkers] = useState([]);
  const [safeGeoJsonLayers, setSafeGeoJsonLayers] = useState([]);
  const [dangerousGeoJsonLayers, setDangerousGeoJsonLayers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newMarker, setNewMarker] = useState(null);
  const [description, setDescription] = useState('');
  const [warningShown, setWarningShown] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [itineraryInfo, setItineraryInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [yellowMarkerPosition, setYellowMarkerPosition] = useState(null);
  const [yellowMarkerInfo, setYellowMarkerInfo] = useState(null);
  const [destinationSearchQuery, setDestinationSearchQuery] = useState('');
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

  const logActivity = async (action) => {
    try {
      await axios.post('http://192.168.100.199:3001/activityLogs', {
        action,
        username: "current-username"
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const fetchSafeZones = async () => {
    try {
      const response = await axios.get('http://192.168.100.199:3001/safezones');
      const safeZones = response.data;
      const safeMarkersFromZones = safeZones.reduce((acc, zone) => {
        return acc.concat(zone.markers.map(marker => ({
          position: marker.coordinates,
          _id: marker._id,
          zoneId: zone._id
        })));
      }, []);
      setSafeMarkers(safeMarkersFromZones);

      const safeGeoJsonData = safeZones.map(zone => {
        const points = zone.markers.map(marker => turf.point([marker.coordinates[1], marker.coordinates[0]]));
        const featureCollection = turf.featureCollection(points);
        return {
          ...convex(featureCollection),
          zoneId: zone._id
        };
      }).filter(Boolean);
      setSafeGeoJsonLayers(safeGeoJsonData);
    } catch (error) {
      console.error('Error fetching safe zones:', error);
    }
  };

  const fetchDangerousZones = async () => {
    try {
      const response = await axios.get('http://192.168.100.199:3001/dangerzones');
      const dangerousZones = response.data;
      const dangerousMarkersFromZones = dangerousZones.reduce((acc, zone) => {
        return acc.concat(zone.markers.map(marker => ({
          position: marker.coordinates,
          description: marker.description || 'No description provided',
          _id: marker._id,
          zoneId: zone._id
        })));
      }, []);
      setDangerousMarkers(dangerousMarkersFromZones);

      const dangerousGeoJsonData = dangerousZones.map(zone => {
        const points = zone.markers.map(marker => turf.point([marker.coordinates[1], marker.coordinates[0]]));
        const featureCollection = turf.featureCollection(points);
        return {
          ...convex(featureCollection),
          zoneId: zone._id
        };
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

  const handleAddMarker = async (latitude, longitude, type) => {
    if (type === 'danger') {
      setNewMarker({ latitude, longitude });
      setIsModalVisible(true);
    } else {
      const markerData = {
        coordinates: [latitude, longitude],
        description: type === 'safe' ? '' : 'Itinerary Point'
      };
      const endpoint = type === 'safe' ? 'http://192.168.100.199:3001/safetymarkers/add' : 'http://192.168.100.199:3001/itinerarymarkers/add';
      try {
        const response = await axios.post(endpoint, markerData);
        if (type === 'safe') {
          setSafeMarkers([...safeMarkers, { position: [latitude, longitude], _id: response.data.data._id }]);
        } else {
          setItineraryMarkers([...itineraryMarkers, { position: [latitude, longitude], _id: response.data.data._id }]);
        }
        await logActivity(`Added ${type} marker at (${latitude}, ${longitude})`);

        await createAlert(latitude, longitude, type);

      } catch (error) {
        console.error('Error adding marker:', error);
      }
    }
  };

  const handleConfirmAddDangerMarker = async () => {
    if (!description.trim()) {
      Alert.alert("Validation Error", "Description cannot be empty");
      return;
    }

    const markerData = {
      coordinates: [newMarker.latitude, newMarker.longitude],
      description
    };
    try {
      const response = await axios.post('http://192.168.100.199:3001/dangermarkers/add', markerData);
      setDangerousMarkers([...dangerousMarkers, { position: [newMarker.latitude, newMarker.longitude], description, _id: response.data.data._id }]);
      setIsModalVisible(false);
      setDescription('');
      await logActivity(`Added danger marker at (${newMarker.latitude, newMarker.longitude})`);

      await createAlert(newMarker.latitude, newMarker.longitude, 'danger');

    } catch (error) {
      console.error('Error adding danger marker:', error);
    }
  };

  const createAlert = async (latitude, longitude, type) => {
    const alertData = {
      type: type === 'safe' ? 'safe' : 'danger',
      coordinates: [latitude, longitude],
      message: `New ${type} zone added at coordinates: (${latitude}, ${longitude})`
    };
    try {
      await axios.post('http://192.168.100.199:3001/alerts', alertData);
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const checkDangerZone = async () => {
    if (location && dangerousGeoJsonLayers.length > 0 && !warningShown) {
      const userLocation = turf.point([location.coords.longitude, location.coords.latitude]);
      const inDangerZone = dangerousGeoJsonLayers.some(layer =>
        booleanPointInPolygon(userLocation, layer)
      );
      if (inDangerZone) {
        showWarning();
        try {
          await axios.post('http://192.168.100.199:3001/alerts', {
            coordinates: [location.coords.latitude, location.coords.longitude]
          });
          await logActivity(`Entered danger zone at (${location.coords.latitude}, ${location.coords.longitude})`);
        } catch (error) {
          console.error('Error sending danger zone alert:', error);
        }
      }
    }
  };

  const showWarning = () => {
    Alert.alert(
      "Warning",
      "You are currently in a danger zone!",
      [{ text: "OK", onPress: () => setWarningShown(true) }]
    );
    setTimeout(() => setWarningShown(false), 300000);
  };

  useEffect(() => {
    checkDangerZone();
    const interval = setInterval(checkDangerZone, 300000);
    return () => clearInterval(interval);
  }, [location, dangerousGeoJsonLayers]);

  const calculateAndSetItinerary = async (endCoordinates) => {
    if (location) {
      const startCoordinates = [location.coords.latitude, location.coords.longitude];
      try {
        const response = await axios.post('http://192.168.100.199:3001/calculate-itinerary', {
          startCoordinates,
          endCoordinates,
          profile: "driving"
        });

        const itinerary = response.data.itinerary;

        if (itinerary && itinerary.routes && itinerary.routes.length > 0) {
          const routeCoordinates = polyline.decode(itinerary.routes[0].geometry);
          const routeLatLngs = routeCoordinates.map(coord => ({ latitude: coord[0], longitude: coord[1] }));

          setRouteCoordinates(routeLatLngs);

          setItineraryInfo({
            distance: itinerary.routes[0].legs[0].distance,
            duration: itinerary.routes[0].legs[0].duration,
            startName: "Current Location",
            endName: "Destination",
            summary: itinerary.routes[0].legs[0].summary
          });
        } else {
          console.log('Itinerary calculation failed:', itinerary);
        }
      } catch (error) {
        console.error('Error calculating itinerary:', error);
      }
    } else {
      Alert.alert("Location Error", "Unable to retrieve current location.");
    }
  };

  const performSearch = async () => {
    try {
      const endpoint = "http://192.168.100.199:3001/mapbox/forward";
      const params = { q: searchQuery, limit: 1 };

      const response = await axios.get(endpoint, { params });

      if (response.data.features.length === 0) {
        Alert.alert("Search Error", "No results found");
        return;
      }

      const result = response.data.features[0];
      const [longitudeResult, latitudeResult] = result.geometry.coordinates;

      setYellowMarkerPosition(null);

      setYellowMarkerPosition({ latitude: latitudeResult, longitude: longitudeResult });

      try {
        const locationResponse = await axios.get("http://192.168.100.199:3001/mapbox/reverse-geocode", {
          params: {
            longitude: longitudeResult,
            latitude: latitudeResult,
          },
        });
        const locationName = locationResponse.data.features[0]?.place_name || "Unknown location";
        setYellowMarkerInfo({ locationName });

        animateToRegion(latitudeResult, longitudeResult);
      } catch (error) {
        console.error("Error fetching location name:", error);
      }
    } catch (error) {
      console.error("Error performing search:", error);
    }
  };

  const searchDestinationAndCalculateItinerary = async () => {
    try {
      const endpoint = "http://192.168.100.199:3001/mapbox/forward";
      const params = { q: destinationSearchQuery, limit: 1 };

      const response = await axios.get(endpoint, { params });

      if (response.data.features.length === 0) {
        Alert.alert("Search Error", "No results found");
        return;
      }

      const result = response.data.features[0];
      const [longitudeResult, latitudeResult] = result.geometry.coordinates;

      calculateAndSetItinerary([latitudeResult, longitudeResult]);
    } catch (error) {
      console.error("Error performing search:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Pressable onPress={performSearch} style={styles.searchButton}>
          <Text style={styles.buttonText}>Search</Text>
        </Pressable>
        <Pressable onPress={signOut} style={styles.logoutButton}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.destinationContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter destination..."
          value={destinationSearchQuery}
          onChangeText={setDestinationSearchQuery}
        />
        <Pressable onPress={searchDestinationAndCalculateItinerary} style={styles.searchButton}>
          <Text style={styles.buttonText}>Calculate Itinerary</Text>
        </Pressable>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 31.54764361241541,
          longitude: -8.756375278549186,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        showsCompass={false}
        loadingEnabled={true}
        showsUserLocation={true}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          Alert.alert(
            "Add Marker",
            "Select the type of marker to add",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Safe", onPress: () => handleAddMarker(latitude, longitude, 'safe') },
              { text: "Danger", onPress: () => handleAddMarker(latitude, longitude, 'danger') }
            ]
          );
        }}
      >
        {safeMarkers.map((marker, index) => (
          <Marker
            key={`safe-${index}`}
            coordinate={{ latitude: marker.position[0], longitude: marker.position[1] }}
            pinColor='green'
          >
            <Callout>
              <Pressable onPress={() => navigation.navigate('DetailsScreen', { id: marker.zoneId, type: 'safe' })}>
                <Text style={styles.calloutText}>View Details</Text>
              </Pressable>
            </Callout>
          </Marker>
        ))}
        {dangerousMarkers.map((marker, index) => (
          <Marker
            key={`dangerous-${index}`}
            coordinate={{ latitude: marker.position[0], longitude: marker.position[1] }}
            pinColor='red'
          >
            <Callout>
              <Pressable onPress={() => navigation.navigate('DetailsScreen', { id: marker.zoneId, type: 'danger' })}>
                <Text style={styles.calloutText}>View Details</Text>
              </Pressable>
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
            tappable
            onPress={() => navigation.navigate('DetailsScreen', { id: layer.zoneId, type: 'safe' })}
          />
        ))}
        {dangerousGeoJsonLayers.map((layer, index) => (
          <Polygon
            key={`dangerous-layer-${index}`}
            coordinates={layer.geometry.coordinates[0].map(([longitude, latitude]) => ({ latitude, longitude }))}
            strokeColor='red'
            fillColor='rgba(255, 0, 0, 0.3)'
            strokeWidth={2}
            tappable
            onPress={() => navigation.navigate('DetailsScreen', { id: layer.zoneId, type: 'danger' })}
          />
        ))}
        {routeCoordinates.length > 0 && (
          <Polyline coordinates={routeCoordinates} strokeColor="#2A629A" strokeWidth={2} />
        )}
        {yellowMarkerPosition && (
          <Marker
            coordinate={yellowMarkerPosition}
            pinColor='blue'
          >
            <Callout>
              <Text>{yellowMarkerInfo?.locationName || "Unknown location"}</Text>
            </Callout>
          </Marker>
        )}
      </MapView>

      {itineraryInfo && (
        <View style={styles.itineraryInfo}>
          <Text style={styles.itineraryText}>Distance: {(itineraryInfo.distance / 1000).toFixed(2)} km</Text>
          <Text style={styles.itineraryText}>Duration: {(itineraryInfo.duration / 3600).toFixed(2)} hrs</Text>
          <Pressable onPress={() => setItineraryInfo(null)} style={styles.closeButton}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      )}

      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Danger Marker</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
          />
          <Pressable onPress={handleConfirmAddDangerMarker} style={styles.confirmButton}>
            <Text style={styles.buttonText}>Add Marker</Text>
          </Pressable>
          <Pressable onPress={() => setIsModalVisible(false)} style={styles.cancelButton}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
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
    padding: 2,
    zIndex: 1,
    marginTop: 50,
  },
  destinationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    zIndex: 1,
    marginTop: 5,
    marginBottom: 5
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#007AFF',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconText: {
    color: 'white',
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  logoutButton: {
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    padding: 5,
    borderRadius: 5,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#808080',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  itineraryInfo: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  itineraryText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  calloutText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
