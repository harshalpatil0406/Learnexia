import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";
import { useAuthStore } from "../store/authStore";
import { getToken } from "../utils/secureStore";

export default function Index() {
  const router = useRouter();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await initializeAuth();
        
        // Small delay to ensure state is fully updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const token = await getToken();

        if (token) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/auth/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/auth/login");
      }
    };

    checkAuth();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}
