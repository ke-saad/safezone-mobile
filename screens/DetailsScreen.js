import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const DetailsScreen = ({ route, navigation }) => {
  const { id, type } = route.params;
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchZone = async () => {
      try {
        const response = await axios.get(`http://192.168.100.199:3001/${type}zones/${id}`);
        const zoneData = response.data;

        // Fetch location names for each marker
        const markersWithLocationNames = await Promise.all(zoneData.markers.map(async (marker) => {
          try {
            const locationResponse = await axios.get('http://192.168.100.199:3001/mapbox/reverse-geocode', {
              params: {
                longitude: marker.coordinates[1],
                latitude: marker.coordinates[0],
              },
            });

            return {
              ...marker,
              place_name: locationResponse.data.features[0]?.place_name || 'Unknown location',
            };
          } catch (error) {
            console.error(`Error fetching location name for marker:`, error);
            return {
              ...marker,
              place_name: 'Unknown location',
            };
          }
        }));

        setZone({ ...zoneData, markers: markersWithLocationNames });
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching ${type} zone:`, error);
        setLoading(false);
      }
    };

    fetchZone();

    return () => {
      setZone(null);
      route.params.id = null;
    };
  }, [id, type]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.message}>Loading...</Text>
      </View>
    );
  }

  if (!zone) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.message}>Zone not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Zone Details</Text>
        <Text style={styles.label}>Markers:</Text>
        {zone.markers && zone.markers.length > 0 ? (
          zone.markers.map((marker, index) => (
            <View key={index} style={styles.markerContainer}>
              <Text style={styles.markerText}>Location: {marker.place_name}</Text>
              <Text style={styles.markerText}>{marker.coordinates[0]},{marker.coordinates[1]}</Text>
              {marker.description && (
                <>
                  <Text style={styles.markerText}>Description: {marker.description}</Text>
                </>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.message}>No markers available.</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default DetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
  markerContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 15,
    width: '100%',
  },
  markerText: {
    fontSize: 16,
    color: '#333',
  },
  message: {
    fontSize: 18,
    color: '#888',
  },
});
