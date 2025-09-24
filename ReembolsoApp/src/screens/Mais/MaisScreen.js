import React from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView } from 'react-native';
import StaticBackground from '../../components/StaticBackground';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';


export default function MaisScreen() {
  const { signOut } = React.useContext(AuthContext);

  return (

    <StaticBackground>
      {/*  */}
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Mais Opções</Text>
        <View style={styles.logoutButtonContainer}>
          <Button
            title="Sair do Aplicativo"
            onPress={signOut} 
            color="#dc3545"
          />
        </View>
        {/*  */}
      </SafeAreaView>
    </StaticBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  logoutButtonContainer: {
    width: '80%',
  }
});