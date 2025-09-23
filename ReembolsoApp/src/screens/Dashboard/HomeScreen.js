import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../../navigation/AppNavigator';
import { removeToken } from '../../storage/authStorage';

export default function HomeScreen() {
    const { signOut } = useContext(AuthContext);

    const handleLogout = async () => {
        await removeToken();
        signOut();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard Principal</Text>
            <Text>Login realizado com sucesso!</Text>
            <Button title="Sair" onPress={handleLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 }
});