import React from 'react';
import { ImageBackground, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const AnimatedBackground = ({ children }) => {
  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimatedBackground;