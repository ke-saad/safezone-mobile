import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const ListScreen = ({ navigation }) => {
    const [safeZones, setSafeZones] = useState([]);
    const [dangerZones, setDangerZones] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const [safeResponse, dangerResponse] = await Promise.all([
                axios.get('http://192.168.1.127:3001/safezones'),
                axios.get('http://192.168.1.127:3001/dangerzones')
            ]);
            setSafeZones(safeResponse.data);
            setDangerZones(dangerResponse.data);
        } catch (error) {
            setError("Failed to fetch zones.");
        }
    };

    const deleteZone = async (id, type) => {
        const endpoint = type === 'safe' ? `http://192.168.1.127:3001/safezones/${id}` : `http://192.168.1.127:3001/dangerzones/${id}`;
        try {
            await axios.delete(endpoint);
            fetchZones();
        } catch (error) {
            setError("Failed to delete zone.");
        }
    };

    const renderZone = ({ item, index, type }) => (
        <View style={styles.zoneContainer}>
            <Text style={styles.zoneText}>Zone {index + 1} ({type})</Text>
            <View style={styles.buttonContainer}>
                <Pressable
                    style={[styles.button, styles.infoButton]}
                    onPress={() => navigation.navigate('DetailsScreen', { id: item._id, type })}
                >
                    <Text style={styles.buttonText}>Show Information</Text>
                </Pressable>

                <Pressable
                    style={[styles.button, styles.deleteButton]}
                    onPress={() => {
                        Alert.alert(
                            "Delete Zone",
                            "Are you sure you want to delete this zone?",
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", onPress: () => deleteZone(item._id, type) }
                            ]
                        );
                    }}
                >
                    <Text style={styles.buttonText}>Delete</Text>
                </Pressable>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>All Zones</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <FlatList
                data={[...safeZones.map((zone, index) => ({ ...zone, type: 'Safe' })), ...dangerZones.map((zone, index) => ({ ...zone, type: 'Dangerous' }))]}
                keyExtractor={item => item._id}
                renderItem={({ item, index }) => renderZone({ item, index, type: item.type })}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#007AFF',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 20,
    },
    list: {
        flexGrow: 1,
    },
    zoneContainer: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    zoneText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        padding: 10,
        borderRadius: 5,
    },
    infoButton: {
        backgroundColor: '#007AFF',
    },
    editButton: {
        backgroundColor: '#FFA500',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ListScreen;
