import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Pressable, Alert, TextInput } from 'react-native';
import MapView, { Callout, Marker, Polygon } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import * as turf from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import convex from '@turf/convex';
import Modal from 'react-native-modal';

const MapScreen = ({ navigation }) => {
  const { signOut } = useAuth();
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
      const response = await axios.get('http://192.168.1.127:3001/safezones');
      const safeZones = response.data;
      const safeMarkersFromZones = safeZones.reduce((acc, zone) => {
        return acc.concat(zone.markers.map(marker => ({
          position: marker.coordinates,
          _id: marker._id
        })));
      }, []);
      setSafeMarkers(safeMarkersFromZones);

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
      const response = await axios.get('http://192.168.1.127:3001/dangerzones');
      const dangerousZones = response.data;
      const dangerousMarkersFromZones = dangerousZones.reduce((acc, zone) => {
        return acc.concat(zone.markers.map(marker => ({
          position: marker.coordinates,
          description: marker.description || 'No description provided',
          _id: marker._id
        })));
      }, []);
      setDangerousMarkers(dangerousMarkersFromZones);

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

  const handleAddMarker = async (latitude, longitude, type) => {
    if (type === 'danger') {
      setNewMarker({ latitude, longitude });
      setIsModalVisible(true);
    } else {
      const markerData = {
        coordinates: [latitude, longitude],
        description: type === 'safe' ? '' : 'Itinerary Point'
      };
      const endpoint = type === 'safe' ? 'http://192.168.1.127:3001/safetymarkers/add' : 'http://192.168.1.127:3001/itinerarymarkers/add';
      try {
        const response = await axios.post(endpoint, markerData);
        if (type === 'safe') {
          setSafeMarkers([...safeMarkers, { position: [latitude, longitude], _id: response.data.data._id }]);
        } else {
          setItineraryMarkers([...itineraryMarkers, { position: [latitude, longitude], _id: response.data.data._id }]);
        }
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
      const response = await axios.post('http://192.168.1.127:3001/dangermarkers/add', markerData);
      setDangerousMarkers([...dangerousMarkers, { position: [newMarker.latitude, newMarker.longitude], description, _id: response.data.data._id }]);
      setIsModalVisible(false);
      setDescription('');
    } catch (error) {
      console.error('Error adding danger marker:', error);
    }
  };

  const handleDeleteMarker = async (markerId, type) => {
    const endpoint = type === 'safe' ? `http://192.168.1.127:3001/safetymarkers/${markerId}` : `http://192.168.1.127:3001/dangermarkers/${markerId}`;
    try {
      await axios.delete(endpoint);
      if (type === 'safe') {
        setSafeMarkers(safeMarkers.filter(marker => marker._id !== markerId));
      } else {
        setDangerousMarkers(dangerousMarkers.filter(marker => marker._id !== markerId));
      }
    } catch (error) {
      console.error('Error deleting marker:', error);
    }
  };

  const checkDangerZone = () => {
    if (location && dangerousGeoJsonLayers.length > 0 && !warningShown) {
      const userLocation = turf.point([location.coords.longitude, location.coords.latitude]);
      const inDangerZone = dangerousGeoJsonLayers.some(layer =>
        booleanPointInPolygon(userLocation, layer)
      );
      if (inDangerZone) {
        showWarning();
      }
    }
  };

  const showWarning = () => {
    Alert.alert(
      "Warning",
      "You are currently in a danger zone!",
      [{ text: "OK", onPress: () => setWarningShown(true) }]
    );
    setTimeout(() => setWarningShown(false), 300000); // Reset warningShown after 5 minutes
  };

  useEffect(() => {
    checkDangerZone();
    const interval = setInterval(checkDangerZone, 300000); // Recheck every 5 minutes
    return () => clearInterval(interval);
  }, [location, dangerousGeoJsonLayers]);

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
            key: 'YOUR_GOOGLE_PLACES_API_KEY',
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
        <Pressable onPress={signOut} style={styles.logoutButton}>
          <Text style={styles.buttonText}>Logout</Text>
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
              { text: "Danger", onPress: () => handleAddMarker(latitude, longitude, 'danger') },
              { text: "Itinerary", onPress: () => handleAddMarker(latitude, longitude, 'itinerary') }
            ]
          );
        }}
      >
        {safeMarkers.map((marker, index) => (
          <Marker
            key={`safe-${index}`}
            coordinate={{ latitude: marker.position[0], longitude: marker.position[1] }}
            pinColor='green'
            onCalloutPress={() => handleDeleteMarker(marker._id, 'safe')}
          >
            <Callout>
              <Pressable onPress={() => handleDeleteMarker(marker._id, 'safe')} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
            </Callout>
          </Marker>
        ))}
        {dangerousMarkers.map((marker, index) => (
          <Marker
            key={`dangerous-${index}`}
            coordinate={{ latitude: marker.position[0], longitude: marker.position[1] }}
            pinColor='red'
            onCalloutPress={() => handleDeleteMarker(marker._id, 'danger')}
          >
            <Callout>
              <Pressable onPress={() => handleDeleteMarker(marker._id, 'danger')} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Delete</Text>
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
    padding: 10,
    zIndex: 1,
    marginTop: 50,
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
});
