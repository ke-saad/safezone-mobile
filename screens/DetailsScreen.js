import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import axios from 'axios';

const DetailsScreen = ({ route, navigation }) => {
  const { id, type } = route.params;
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchMarker = async () => {
      try {
        const response = await axios.get(`http://192.168.1.127:3001/${type}markers/${id}`);
        setMarker(response.data);
      } catch (error) {
        console.error(`Error fetching ${type} marker:`, error);
      }
    };

    fetchMarker();

    return () => {
      setMarker(null);
      route.params.id = null;  // Reset id when leaving the screen
    };
  }, [id, type]);

  if (!marker) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Marker Details</Text>
      <Text style={styles.label}>Coordinates:</Text>
      <Text>{marker.coordinates.join(', ')}</Text>
      {marker.description && (
        <>
          <Text style={styles.label}>Description:</Text>
          <Text>{marker.description}</Text>
        </>
      )}
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

export default DetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  message: {
    fontSize: 18,
  },
});
