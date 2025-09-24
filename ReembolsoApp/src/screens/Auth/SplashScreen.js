import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, withSpring, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native'; 

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation();

  const logoScale = useSharedValue(0.5); 
  const logoOpacity = useSharedValue(0); 
  const backgroundOpacity = useSharedValue(0); 

  useEffect(() => {

    backgroundOpacity.value = withTiming(1, { duration: 1000, easing: Easing.ease });

    logoOpacity.value = withTiming(1, { duration: 1500, easing: Easing.ease });
    logoScale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    }, (finished) => {
      if (finished) {
        runOnJS(navigation.replace)('Login'); 
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/images/background.png')} 
        style={[styles.backgroundImage, { opacity: backgroundOpacity }]}
        resizeMode="cover"
      />
      <Animated.Image
        source={require('../../assets/images/logo.png')} 
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', 
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject, 
    width: width,
    height: height,
  },
  logo: {
    width: width * 0.7, 
    height: width * 0.7, 
  },
});