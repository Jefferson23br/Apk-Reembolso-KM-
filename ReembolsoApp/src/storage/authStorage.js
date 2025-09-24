import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (e) {
    console.error("Failed to save the token to storage", e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (e) {
    console.error("Failed to fetch the token from storage", e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (e) {
    console.error("Failed to remove the token from storage", e);
  }
};

export const storeLastUser = async (email) => {
  try {
    await AsyncStorage.setItem('lastUserEmail', email);
  } catch (e) {
    console.error("Failed to save the last user email", e);
  }
};

export const getLastUser = async () => {
  try {
    return await AsyncStorage.getItem('lastUserEmail');
  } catch (e) {
    console.error("Failed to fetch the last user email", e);
    return null;
  }
};

export const removeLastUser = async () => {
    try {
      await AsyncStorage.removeItem('lastUserEmail');
    } catch (e) {
      console.error("Failed to remove the last user email", e);
    }
  };