import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

const backgroundImage = require('../assets/images/background.png');

export default function StaticBackground({ children }) {
  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover" 
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});