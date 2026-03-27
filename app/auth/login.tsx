
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "All fields are required");
    }

    try {
      await login(email, password);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Login Failed", error?.message || "Invalid credentials");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gradient-to-b from-blue-50 to-white"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header Section */}
          <View className="items-center mb-10">
            <View className="bg-blue-500 w-20 h-20 rounded-full items-center justify-center mb-4 shadow-lg">
              <Ionicons name="school" size={40} color="white" />
            </View>
            <Text className="text-4xl font-bold text-gray-800 mb-2">
              Welcome Back
            </Text>
            <Text className="text-gray-500 text-base text-center">
              Sign in to continue your learning journey
            </Text>
          </View>

          {/* Form Section */}
          <View className="space-y-4">
            {/* Email Input */}
            <View>
              <Text className="text-gray-700 font-medium mb-2 ml-1">Email</Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 shadow-sm">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 p-4 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-gray-700 font-medium mb-2 ml-1 mt-2">Password</Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 shadow-sm">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 p-4 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Pressable onPress={() => router.push("/auth/forgot-password")}>
                <Text className="text-right text-blue-500 text-sm font-medium pt-2">
                  Forgot Password?
                </Text>
              </Pressable>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className={`bg-blue-500 p-4 rounded-2xl mt-6 shadow-lg ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Sign In
                </Text>
              )}
            </Pressable>
          </View>

          {/* Footer Section */}
          <View className="mt-8">
            <View className="flex-row items-center justify-center">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            <Pressable 
              onPress={() => router.push("/auth/register")}
              className="mt-6"
            >
              <Text className="text-center text-gray-600">
                Don't have an account?{" "}
                <Text className="text-blue-500 font-semibold">Sign Up</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


