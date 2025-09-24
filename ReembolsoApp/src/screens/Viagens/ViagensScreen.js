import React from 'react';
import { Text, StyleSheet, SafeAreaView } from 'react-native';
import StaticBackground from '../../components/StaticBackground';

export default function ViagensScreen() {
  return (
    <StaticBackground>
      {/* ------------ */}
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Minhas Viagens</Text>
        {/* -----------------i */}
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  }
});