import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/Dashboard/HomeScreen';
import ViagensScreen from '../screens/Viagens/ViagensScreen';
import DespesasScreen from '../screens/Despesas/DespesasScreen';
import VeiculosScreen from '../screens/Veiculos/VeiculosScreen';
import MaisScreen from '../screens/Mais/MaisScreen';
import VehicleFormScreen from '../screens/Veiculos/VehicleFormScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Inicio" component={HomeScreen} />
  </Stack.Navigator>
);

const ViagensStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Viagens" component={ViagensScreen} />
  </Stack.Navigator>
);

const DespesasStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Despesas" component={DespesasScreen} />
  </Stack.Navigator>
);

const VeiculosStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
          name="VeiculosList" 
          component={VeiculosScreen} 
      />
      <Stack.Screen 
          name="VehicleForm" 
          component={VehicleFormScreen} 
      />
  </Stack.Navigator>
);

const MaisStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Mais" component={MaisScreen} />
  </Stack.Navigator>
);


export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ViagensTab') {
            iconName = focused ? 'car-sport' : 'car-sport-outline';
          } else if (route.name === 'DespesasTab') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'VeiculosTab') {
            iconName = focused ? 'key' : 'key-outline';
          } else if (route.name === 'MaisTab') {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e90ff',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
            backgroundColor: '#fff',
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Início' }} />
      <Tab.Screen name="ViagensTab" component={ViagensStack} options={{ title: 'Viagens' }} />
      <Tab.Screen name="DespesasTab" component={DespesasStack} options={{ title: 'Despesas' }} />
      <Tab.Screen name="VeiculosTab" component={VeiculosStack} options={{ title: 'Veículos' }} />
      <Tab.Screen name="MaisTab" component={MaisStack} options={{ title: 'Mais' }} />
    </Tab.Navigator>
  );
}