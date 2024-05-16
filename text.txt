import * as React from 'react';
import { useState, useEffect } from 'react';
import MapView, { AnimatedRegion, Callout, Circle, Marker } from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, useColorScheme, Image} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from 'axios';

export default function App() {

  const [ nationalData, setnationalData ] = useState({})
  
  const axiosInstance = axios.create({ baseURL: 'https://www.nationaltrust.org.uk/search/data/all-places' });

  useEffect(() => {
    axiosInstance.get().then((response) => {
      setnationalData(response.data)
    })
  }, [])

  console.log(nationalData.location)
  console.log(nationalData.title)
  console.log(nationalData.imageUrl)

  const [region, setRegion] = useState({
    latitude: 55.378051,
    longitude: -3.435973,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })

  const colourScheme = useColorScheme();
  const isDarkMode = colourScheme === "dark";

  return (
    <View style={{flex: 0, backgroundColor: "white"}}>
      <GooglePlacesAutocomplete
        placeholder='Search...'
        fetchDetails={true}
        autoFocus={true}
        GooglePlacesSearchQuery={{
          rankby: "distance"
        }}
        onPress={(data, details = null) => {
          // 'details' is provided when fetchDetails = true
          console.log(data, details);
          setRegion({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            latitudeDelta: 0.0222,
            longitudeDelta: 0.0221,
          })
        }}
        query={{
          key: "AIzaSyAM0Qz2KaxfVQTNaiCCtQzQ66rlkUzEv90",
          language: 'en',
        }}
        styles = {{
          container: { flex: 0, position: "absolute", zIndex: 1, marginTop: 60, margin: 10, width: "95%"},
          listView: { backgroundColor: "white" }
        }}
      />
  
      <MapView 
        style={styles.map} 
        region={region}
        showsCompass={false}
        userInterfaceStyle={isDarkMode ? "dark" : "light"}
      >
        {Object.values(nationalData).map(index => {
          return <Marker 
            coordinate={index.location}
            title={index.title}
            description={index.description}
            width={10}
            pinColor="blue"
          />
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: (Platform.OS === 'ios') ? Dimensions.get('window').height : "100%",
  },
});