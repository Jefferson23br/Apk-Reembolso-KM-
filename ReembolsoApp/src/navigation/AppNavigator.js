import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { getToken } from '../storage/authStorage';

export const AuthContext = React.createContext();

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
  
  const authContext = React.useMemo(() => ({
    signIn: (token) => {
      setUserToken(token);
    },
    signOut: () => {
      setUserToken(null);
    },
  }), []);

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

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