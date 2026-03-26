import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { forgotPassword } from "../../services/authService";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      return Alert.alert("Error", "Please enter your email address");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert("Error", "Please enter a valid email address");
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      setLoading(false);

      Alert.alert(
        "Success",
        "Password reset email has been sent to your email address. Please check your inbox.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      setLoading(false);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send reset email. Please try again."
      );
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
        <View className="flex-1 px-6 py-12">
          {/* Back Button */}
          <Pressable 
            onPress={() => router.back()}
            className="flex-row items-center mb-8"
          >
            <Ionicons name="arrow-back" size={24} color="#3B82F6" />
            <Text className="text-blue-500 ml-2 text-base font-semibold">Back to Login</Text>
          </Pressable>

          {/* Header Section */}
          <View className="items-center mb-10 mt-8">
            <View className="bg-blue-500 w-20 h-20 rounded-full items-center justify-center mb-4 shadow-lg">
              <Ionicons name="lock-closed" size={40} color="white" />
            </View>
            <Text className="text-4xl font-bold text-gray-800 mb-2">
              Forgot Password?
            </Text>
            <Text className="text-gray-500 text-base text-center px-4">
              Don't worry! Enter your email address and we'll send you instructions to reset your password.
            </Text>
          </View>

          {/* Form Section */}
          <View className="space-y-4">
            {/* Email Input */}
            <View>
              <Text className="text-gray-700 font-medium mb-2 ml-1">Email Address</Text>
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

            {/* Submit Button */}
            <Pressable
              onPress={handleForgotPassword}
              disabled={loading}
              className={`bg-blue-500 p-4 rounded-2xl mt-6 shadow-lg ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Send Reset Link
                </Text>
              )}
            </Pressable>
          </View>

          {/* Info Section */}
          <View className="mt-8 bg-blue-50 p-4 rounded-2xl">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <View className="flex-1 ml-3">
                <Text className="text-gray-700 font-semibold mb-1">
                  Check your email
                </Text>
                <Text className="text-gray-600 text-sm">
                  If an account exists with this email, you'll receive password reset instructions. Please check your spam folder if you don't see it.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
