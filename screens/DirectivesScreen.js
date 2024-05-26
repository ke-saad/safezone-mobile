import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

const DirectivesScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Safety Directives</Text>
      <Text style={styles.subtitle}>What to Do When Endangered</Text>
      <View style={styles.directiveContainer}>
        <Text style={styles.number}>1.</Text>
        <Text style={styles.text}>Stay Calm: Keep a clear head and stay calm.</Text>
      </View>
      <View style={styles.directiveContainer}>
        <Text style={styles.number}>2.</Text>
        <Text style={styles.text}>Move to Safety: If possible, move to a safe area away from the danger zone.</Text>
      </View>
      <View style={styles.directiveContainer}>
        <Text style={styles.number}>3.</Text>
        <Text style={styles.text}>Alert Authorities: Contact local authorities or emergency services.</Text>
      </View>
      <View style={styles.directiveContainer}>
        <Text style={styles.number}>4.</Text>
        <Text style={styles.text}>Inform Others: Warn others in the vicinity about the danger.</Text>
      </View>
      <View style={styles.directiveContainer}>
        <Text style={styles.number}>5.</Text>
        <Text style={styles.text}>Follow Official Instructions: Adhere to instructions from emergency services and authorities.</Text>
      </View>
      <View style={styles.directiveContainer}>
        <Text style={styles.number}>6.</Text>
        <Text style={styles.text}>Stay Updated: Keep informed about the situation through reliable news sources and updates.</Text>
      </View>
      <View style={styles.directiveContainer}>
        <Text style={styles.number}>7.</Text>
        <Text style={styles.text}>Use the App: Utilize this app to mark safe zones and report danger zones.</Text>
      </View>
    </ScrollView>
  );
};

export default DirectivesScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  directiveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingLeft: 10,
    paddingRight: 10,
  },
  number: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 10,
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});
