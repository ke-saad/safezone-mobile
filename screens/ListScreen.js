import { StyleSheet, Text, View, Pressable, Image, FlatList, TextInput, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import TopList from '../components/topList';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import data from '../components/all-places.json';

const ListScreen = ({navigation, route}) => {

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => { //useEffect function used to gain the users permission for their location.
      (async () => {  // The app will run regardless, it just allows the user to see where they are on the map...
                      // ... in relation to national trust places
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      })();
    }, []);

    let text = 'Waiting..';
    if (errorMsg) {
      text = errorMsg;
    } else if (location) {
      text = JSON.stringify(location);
      //console.log(location)
    }

    // useState variables used to store data
    const [ nationalData, setnationalData ] = useState({})
    const [ refreshing, serRefreshing ] = useState(false) // used to refresh flatList
    const [value, onChangeText] = useState('')
    const [ localData, setlocalData ] = useState({})

    // axios and use effect function used here to pull data from national trust 
    // const axiosInstance = axios.create({ baseURL: 'https://www.nationaltrust.org.uk/search/data/all-places' });

    // useEffect(() => {
    //   axiosInstance.get().then((response) => {
    //       setnationalData(Object.values(response.data))
    //       setlocalData(Object.values(response.data))
    //   })
    // }, [])

    useEffect(() => {
      setnationalData(Object.values(data))
    }, []);

    const handleSearch = (text) => {  //Allows flatList to be filtered (seachred)
      //console.log(text)
      onChangeText(text);
      let items = localData;
      let newData = items;

      if (text) {
        newData = items.filter(item => {
        const itemData = item.title.toLowerCase();
        const textData = text.toLowerCase();
        
        return itemData.indexOf(textData) > -1; 
        });
      }

      setnationalData(newData);
      }

      const calculateDistance = () => { // This function isn't used, however, shows how its possible to calculate
        var dis = getDistance(          //the users distance from a set longitude and latitude
          { latitude: 51.528308, longitude: -0.3817765 },
          { latitude: 51.528308, longitude: -0.3817765 }
        );
        //console.log(`Distance\n\n${dis} Meters\nOR\n${dis / 1609} Miles`);
      };
      
      calculateDistance();
  return ( // Returns the views and flatlist for the page
    <View style={styles.container}>
      <TopList />
      <TextInput // Input used to call the search function(filtering the list)
        style={styles.textInputStyle}
        onChangeText={(text) => handleSearch(text)}
        underlineColorAndroid="transparent"
        value={value}
        placeholder="Search by name..."
        placeholderTextColor={"grey"}
      />
      <FlatList // Flatlist that takes in the data that axois got and displays it within a touchable opacity 
        style={styles.flatlist} 
        data={nationalData}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.main} onPress={() => navigation.push("DetailsScreen", {paramA: item.id, paramB: item.location})}>
            <Image source={{ uri: item.imageUrl }} style={styles.image}></Image>
            <View style={styles.card}>
                <Text style={styles.texttitle}>{item.title}</Text>
                <Text numberOfLines={2} style={styles.textsubtitle}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
        //refreshing={refreshing}
      />
    </View>
  )
}

export default ListScreen

const styles = StyleSheet.create({ //Provides all the styling for the page
  container: {
    flex: 1,
  },
  main: {
    width: "48%",
    margin: 4,
    height: "auto",
  },
  image: {
    width: "100%",
    height: 110,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  card: {
    backgroundColor: "white",
    height: 150,
    shadowColor: "black",
    width: "100%",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowOffset: {
    width: 0,
    height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  texttitle: {
    marginHorizontal: 5, 
    marginTop: 10,
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    color: "#007A3B"
  },
  textsubtitle: {
      marginHorizontal: 5,
      marginTop: 5,
      textAlign: "center",
      color: "#007A3B",
      marginBottom: 10
  },
  moreInfo: {
    alignSelf: "center",
    margin: 15,
    color: "#007A3B",
    fontWeight: "bold",
    textAlign: "center"
  },
  textInputStyle: {
    height: 40,
    paddingLeft: 20,
    margin: 5,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  flatlist: {
    marginBottom: 100,
  }
})