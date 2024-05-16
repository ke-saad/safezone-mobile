import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Ensure proper import

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth(); // Use the signIn method from AuthContext

    const handleLogin = async () => {
        try {
            console.log('Attempting to login with:', { username, password });

            const response = await axios.post('http://192.168.0.195:3001/userslogin', {
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
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button
                title="Login"
                onPress={handleLogin}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    input: {
        width: '80%',
        padding: 10,
        margin: 10,
        borderWidth: 1,
        borderColor: '#ddd'
    }
});

export default LoginScreen;
