
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const deleteToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const saveRefreshToken = async (refreshToken: string) => {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

export const deleteRefreshToken = async () => {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

export const saveUser = async (user: any) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save user:", error);
  }
};

export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Failed to get user:", error);
    return null;
  }
};

export const deleteUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Failed to delete user:", error);
  }
};
