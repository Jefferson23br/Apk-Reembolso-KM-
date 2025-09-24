import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Dashboard/HomeScreen';

const Stack = createStackNavigator();

export default function MainTabNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Painel' }}
      />
    </Stack.Navigator>
  );
}