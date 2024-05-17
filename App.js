import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './context/AuthContext';

import MapScreen from './screens/MapScreen';
import ListScreen from './screens/ListScreen';
import DetailsScreen from './screens/DetailsScreen';
import LoginScreen from './screens/LoginScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          bottom: 30,
          left: 10,
          right: 10,
          backgroundColor: "white",
          borderTopColor: "white",
          position: "absolute",
          borderRadius: 15,
          height: 70,
          tabBarShowLabel: "true",
          paddingBottom: 0,
          ...styles.shadow,
        },
        tabBarIcon: ({ focused }) => {
          const icons = {
            MapScreen: focused ? "map" : "map-outline",
            ListScreen: focused ? "list" : "list-outline",
            DetailsScreen: focused ? "information-circle" : "information-circle-outline",
          };
          return <Ionicons name={icons[route.name]} size={30} color={"#007AFF"} />;
        },
      })}
    >
      <Tab.Screen name="MapScreen" component={MapScreen} />
      <Tab.Screen name="ListScreen" component={ListScreen} />
      <Tab.Screen name="DetailsScreen" component={DetailsScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppWrapper() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});
