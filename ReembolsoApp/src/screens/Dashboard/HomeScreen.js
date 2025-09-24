import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { removeToken } from '../../storage/authStorage';
import AnimatedBackground from '../../components/AnimatedBackground'; 

export default function HomeScreen() {
    const { signOut } = useContext(AuthContext);

    const handleLogout = async () => {
        await removeToken();
        signOut();
    };

    return (
        <AnimatedBackground> {/*  */}
            <View style={styles.overlay}>
                <Image
                    source={require('../../assets/images/logo.png')} 
                    style={styles.dashboardLogo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Dashboard Principal</Text>
                <Text style={styles.subtitle}>Login realizado com sucesso!</Text>
                <Button title="Sair" onPress={handleLogout} />
            </View>
        </AnimatedBackground>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
        width: '100%',
        padding: 20,
    },
    dashboardLogo: {
        width: 100,
        height: 100,
        marginBottom: 30,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 30,
    }
});