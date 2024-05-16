import { StyleSheet, Text, View, Image, ScrollView, Pressable, ImageBackground } from 'react-native'
import { useState, useEffect } from 'react'
import React from 'react'
import axios from 'axios'
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import clear from '../assets/clear.png'
import rainy from '../assets/rainy.png'
import snowy from '../assets/snowy.png'
import stormy from '../assets/stormy.png'
import sunny from '../assets/sunny.png'
import foggy from '../assets/foggy.png'
import noCSunny from '../assets/noCSunny.png'
import data from '../components/all-places.json';

const DetailsScreen = ({route, navigation}) => {

    let KEY = "###################" //API Key for Openweathermap 

    const [temperature, setTemperature] = useState("");
    const [backgroundUrl, setBackground] = useState(null)

    useEffect(() => { //Useeffect await function gets data from open weather and sets background of particular view accordingly
        async function fetchWeather(lat, lon) {
            await axios
            .get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${KEY}&units=metric`)
            .then((response) => {
                console.log(response.data.weather);
                setTemperature(response.data.main.temp);
                if ( response.data.weather[0].main === "Rain") {
                    setBackground(Image.resolveAssetSource(rainy).uri)
                } else if (response.data.weather[0].main === "Clouds" 
                        && response.data.weather[0].description != "few clouds" ) {
                    setBackground(Image.resolveAssetSource(clear).uri)
                } else if (response.data.weather[0].main === "Fog"
                        || response.data.weather[0].main === "Mist"
                        || response.data.weather[0].main === "Smoke"
                        || response.data.weather[0].main === "Haze"
                        || response.data.weather[0].main === "Dust") {
                    setBackground(Image.resolveAssetSource(foggy).uri)
                } else if ( response.data.weather[0].description === "few clouds" ) {
                    setBackground(Image.resolveAssetSource(sunny).uri)
                } else if ( response.data.weather[0].main === "Clear" ) {
                    setBackground(Image.resolveAssetSource(noCSunny).uri)
                } else if (response.data.weather[0].main === "Squall"
                        || response.data.weather[0].main === "Tornado") {
                    setBackground(Image.resolveAssetSource(stormy).uri)
                } else if (response.data.weather[0].main === "Snow") {
                    setBackground(Image.resolveAssetSource(snowy).uri)
                } else if (response.data.weather[0].main === "Drizzle") {
                    setBackground(Image.resolveAssetSource(stormy).uri)
                }

            })
            .catch(error => {
                console.log(error)
            });
        }
        fetchWeather(latitude, longitude)
        console.log("weather fetched")
    }, []);

    const [ placeData, setplaceData ] = useState(); //Variable set for containg all data from NT All-place data
  
    // const axiosInstance = axios.create({ baseURL: 'https://www.nationaltrust.org.uk/search/data/all-places' });
    // //Above is the link used to obtain NT data
    // useEffect(() => {
    //     const axoisGET = async () => {
    //         await axiosInstance.get().then((response) => {
    //             setplaceData(response.data[route.params.paramA])//Set data to variable initialised above
    //         })
    //     }
    //     axoisGET(); 
    // }, []);

    useEffect(() => {
        console.log(data[route.params.paramA])
        setplaceData(data[route.params.paramA])
      }, []);

    const {latitude, longitude} = route.params.paramB; //set Longitude and Latitude from data passed from the "listScreen"

    const hasActivities = (activites) => { //function used to establish if a data item contains activities
        if (activites != null) {           //Displays or doesn't display view depending on the condition
            return (
                <View>
                    <Text style={styles.activitesTitle}>Activies:</Text>
                    <Text style={styles.openStatusText}>{activites}</Text>
                </View>
            )
        }
    }

    const hasMoreInfo = (moreInfo) => { //function used to establish if a data item contains more info
        if (moreInfo != null) {         //Displays or doesn't display view depending on the condition
            return (
                <View>
                    <Text style={styles.moreInfo}>More Info</Text>
                    <Text style={styles.openStatusText}>{moreInfo}</Text>
                </View>
            )
        }
    }

    const hasSubtitle = (subTitle) => { //function used to establish whats contained within the "subtitle"
        if (subTitle != null) {
            if (subTitle.includes("near"))         //Removes the word "near" if found within the subtitle
                subTitle = subTitle.replace("near", "");
            return (
                <Text style={styles.detailsTitle}>{subTitle}</Text>
            )
        } else if (subTitle == null) {
            return (
                <Text style={styles.detailsTitle}>{subTitle}</Text>
            )
        }
    }

    if (placeData) 
    {
    return ( //The main view of the page - contains everything that's displayed
        <ScrollView showsVerticalScrollIndicator={false}> 
            <View style={styles.container}>
                <View style={styles.topView}>
                    <Image source={{ uri: placeData.imageUrl }} style={styles.image} accessibilityLabel={placeData.imageDescription}></Image>
                    <View style={styles.titleview}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.buttonback}>
                            <Ionicons name={"arrow-back-circle"} size={35} color={"#007A3B"}/>
                        </Pressable>
                        <Text style={styles.title} numberOfLines={1}>{placeData.title}</Text>
                    </View>
                </View>
                <View style={styles.descriptionView}>
                    {hasSubtitle(placeData.subTitle)}
                    {/* <Text style={styles.detailsTitle}>{placeData.subTitle}</Text> */}
                    <Text style={styles.detailsSubtitle}>{placeData.description}</Text>
                </View>
                <View style={styles.openStatusView}>
                    {hasMoreInfo(placeData.openingTimeStatus)}
                    {/* <Text style={styles.moreInfo}>More Info</Text>
                    <Text style={styles.openStatusText}>{placeData.openingTimeStatus}</Text> */}
                    {hasActivities(placeData.activityTagsAsCsv)}
                    {/* <Text style={styles.activitesTitle}>Activies:</Text>
                    <Text style={styles.openStatusText}>{placeData.activityTagsAsCsv}</Text> */}
                </View>
                <View style={styles.mapOuterView} >
                    <MapView //Displays a map within this view - uses React Native Map View
                        mapType={"mutedStandard"}
                        style={styles.map}
                        region={{
                            latitude: latitude,
                            longitude: longitude,
                            latitudeDelta: 0.9,
                            longitudeDelta: 0.5,
                        }}
                        showsCompass={false}
                        loadingEnabled={true}
                        scrollEnabled={false}
                        >
                        <Marker //Displays a "pin" on the map, the coordinates given by the data passed from the "listScreen"
                            key={route.params.paramA}
                            coordinate={route.params.paramB}
                            width={"auto"}
                            height={"auto"}
                            pinColor="#659136"
                        />
                    </MapView>
                </View>
                <View style={styles.weatherView}>
                    <ImageBackground //Sets the background of this view
                        source={{uri: backgroundUrl}} // The background is decided from the function declared earlier
                        resizeMode="cover"
                        style={styles.imageBackground}
                        imageStyle={{ borderRadius: 25}}
                    >
                        <Text style={styles.weatherTemperatureText}>{temperature}{"\u00B0"} C</Text>
                    </ImageBackground>
                </View>
            </View>
        </ScrollView>
    )
}
}

export default DetailsScreen

const styles = StyleSheet.create({ //Provides all the styling for the page
    container: {
        flex: 1,
        paddingBottom: 50,
        marginBottom: 150,
    },
    topView: {
        backgroundColor: "white",
        height: "auto"
    },
    topView: {
        backgroundColor: "white",
        height: "auto",
    },
    image: {
        width: "100%",
        height: 250,
    },
    titleview: {
        flexDirection: "row",
        position: "absolute",
        backgroundColor: "white",
        width: "95%",
        height: "20%",
        margin: 220,
        alignSelf: "center",
        borderRadius: 25,
        shadowOffset: {
            width: 0,
            height: 4,
            },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
        justifyContent: "center",
        zIndex: 100,
    },
    title: {
        textAlign: "center",
        color: "#007A3B",
        fontWeight: "bold",
        alignSelf: "center",
        fontSize: 25,
        maxWidth: "70%"
    },
    buttonback: {
        alignSelf: "center",
        marginLeft: 5,
        position: "absolute",
        left: 0,
    },
    descriptionView: {
        backgroundColor: "#007A3B",
        width: "95%",
        height: "auto",
        marginTop: 30,
        paddingHorizontal: 5,
        alignSelf: "center",
        borderRadius: 25,
        shadowOffset: {
            width: 0,
            height: 4,
            },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
        justifyContent: "center",
        zIndex: 100
    },
    detailsSubtitle: {
        marginBottom: 15,
        marginTop: 10,
        paddingHorizontal: 5,
        color: "white",
        textAlign: "center"
    },
    detailsTitle: {
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
        color: "white"
    },
    mapOuterView: {
        shadowOffset: {
            width: 0,
            height: 4,
            },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
        width: "95%",
        height: 200,
        borderWidth: 1,
        borderColor: "transparent",
        alignItems: "center",
        marginTop: 10,
        borderRadius: 25,
        overflow: (Platform.OS === "ios") ? "visible" : "hidden",
        alignSelf: "center"
    },
    map: {
        width: "100%",
        height: "100%",
        marginHorizontal: 10,
        borderRadius: 25
    },
    openStatusView: {
        backgroundColor: "white",
        width: "95%",
        height: "auto",
        marginTop: 10,
        alignSelf: "center",
        borderRadius: 25,
        shadowOffset: {
            width: 0,
            height: 4,
            },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
        justifyContent: "center",
        zIndex: 100
    },
    openStatusText: {
        marginBottom: 15,
        marginTop: 10,
        color: "#007A3B",
        textAlign: "center"
    },
    moreInfo: {
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
        color: "#007A3B"
    },
    activitesTitle: {
        textAlign: "center",
        fontWeight: "bold",
        color: "#007A3B"
    },
    weatherView: {
        backgroundColor: "white",
        width: "95%",
        height: "12%",
        marginTop: 10,
        alignSelf: "center",
        borderRadius: 25,
        shadowOffset: {
            width: 0,
            height: 4,
            },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,
        justifyContent: "center",
        zIndex: 100
    },
    weatherTemperatureText: {
        color: "white",
        textAlign: "center",
        fontSize: 25,
        fontWeight: "bold"
    },
    imageBackground: {
        height: "100%",
        justifyContent: "center",
    }
})
