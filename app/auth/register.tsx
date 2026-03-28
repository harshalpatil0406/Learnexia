
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { registerUser } from "../../services/authService";
import { getErrorMessage } from "../../services/api";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      return Alert.alert("Error", "All fields are required");
    }

    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    if (password.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters");
    }

    try {
      setLoading(true);

      await registerUser({
        email: email.trim(),
        password: password.trim(),
        username: name
          .toLowerCase()
          .replace(/\s+/g, ""),
        role: "USER",
      });

      setLoading(false);

      Alert.alert("Success", "Account created successfully! Please login.");

      router.replace("/auth/login");
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Registration Failed", getErrorMessage(error));
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
          <View className="items-center mb-8">
            <View className="bg-blue-500 w-20 h-20 rounded-full items-center justify-center mb-4 shadow-lg">
              <Ionicons name="person-add" size={40} color="white" />
            </View>
            <Text className="text-4xl font-bold text-gray-800 mb-2">
              Create Account
            </Text>
            <Text className="text-gray-500 text-base text-center">
              Start your learning journey with Learnexia
            </Text>
          </View>

          {/* Form Section */}
          <View className="space-y-4">
            {/* Name Input */}
            <View>
              <Text className="text-gray-700 font-medium mb-2 ml-1">Full Name</Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 shadow-sm">
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  className="flex-1 p-4 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Email Input */}
            <View>
              <Text className="text-gray-700 font-medium mb-2 mt-2 ml-1">Email</Text>
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
              <Text className="text-gray-700 font-medium mb-2 mt-2 ml-1">Password</Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 shadow-sm">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Create a password"
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

            {/* Confirm Password Input */}
            <View>
              <Text className="text-gray-700 font-medium mb-2 mt-2 ml-1">Confirm Password</Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 shadow-sm">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className="flex-1 p-4 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <Pressable
              onPress={handleRegister}
              disabled={loading}
              className={`bg-blue-500 p-4 rounded-2xl mt-6 shadow-lg ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Create Account
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
              onPress={() => router.replace("/auth/login")}
              className="mt-6"
            >
              <Text className="text-center text-gray-600">
                Already have an account?{" "}
                <Text className="text-blue-500 font-semibold">Sign In</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}