import React, { useState, useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { getToken } from '../storage/authStorage';
import { AuthContext } from '../context/AuthContext';

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token;
      try {
        token = await getToken();
      } catch (e) {
        console.error(e);
      }
      setUserToken(token);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);
  
  const authContext = useMemo(() => ({
    signIn: (token) => {
      setUserToken(token);
    },
    signOut: () => {
      setUserToken(null);
    },
  }), []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
 // teste
  return (
    <AuthContext.Provider value={authContext}>
      {userToken == null ? (
        <AuthNavigator />
      ) : (
        <MainTabNavigator />
      )}
    </AuthContext.Provider>
  );
}