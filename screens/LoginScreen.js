import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Alert, Image, Text } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Ensure proper import

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth(); // Use the signIn method from AuthContext

    const handleLogin = async () => {
        try {
            console.log('Attempting to login with:', { username, password });

            const response = await axios.post('http://192.168.100.199:3001/userslogin', {
                username: username,
                password: password
            });

            console.log('Response:', response);

            if (response.data.token) {
                signIn({ token: response.data.token }); // Use signIn to update context
            } else {
                Alert.alert('Login Error', 'No token received from server.');
            }
        } catch (error) {
            if (error.response) {
                console.log('Error Response:', error.response);
                Alert.alert('Login Failed', error.response.data.message);
            } else if (error.request) {
                console.log('Error Request:', error.request);
                Alert.alert('Login Failed', 'No response from server. Check network connection.');
            } else {
                console.log('Error', error.message);
                Alert.alert('Login Failed', 'An unexpected error occurred.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>GeoGuard</Text>
            <Image
                source={require('../assets/icon.png')}
                style={styles.icon}
            />
            <Text style={styles.title}>Your Safety Matters the Most</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#888"
            />
            <Pressable onPress={handleLogin} style={styles.loginButton}>
                <Text style={styles.buttonText}>Login</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    },
    icon: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: 'white',
    },
    input: {
        width: '80%',
        padding: 10,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    loginButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
