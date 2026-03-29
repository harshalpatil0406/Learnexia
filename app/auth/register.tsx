import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { getErrorMessage } from "../../services/api";
import { registerUser } from "../../services/authService";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Register() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const handleRegister = async () => {
    setErrorMessage(""); // Clear previous errors
    
    if (!name || !email || !password || !confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await registerUser({
        email: email.trim(),
        password: password.trim(),
        username: name
          .toLowerCase()
          .replace(/\s+/g, ""),
        role: "USER",
      });

      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/auth/login");
    } catch (error: any) {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleButtonPress = () => {
    handleRegister();
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-b from-purple-50 to-white'}`}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header Section */}
          <View className="items-center mb-6">
            {/* App Logo */}
            <View className="relative mb-4">
              <Image 
                source={require('@/assets/images/logo.png')}
                style={{ width: 80, height: 80, borderRadius: 20 }}
                resizeMode="contain"
              />
            </View>

            <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
              Join Learnexia
            </Text>
            <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm text-center px-8`}>
              Start your learning journey today
            </Text>
          </View>

          {/* Form Section */}
          <View className="space-y-3">
            {/* Error Message */}
            {errorMessage ? (
              <View className="flex-row items-center justify-center mb-2">
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text className="text-red-500 ml-2 text-sm font-medium">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Name Input */}
            <View>
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-semibold mb-2 ml-1`}>
                Full Name
              </Text>
              <View className={`flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-white'} ${
                nameFocused ? 'border-2 border-purple-500' : 'border border-gray-200'
              } rounded-2xl px-4 shadow-sm`}>
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={nameFocused ? '#8B5CF6' : '#9CA3AF'} 
                />
                <TextInput
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => {
                    setNameFocused(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  onBlur={() => setNameFocused(false)}
                  className={`flex-1 p-4 ${isDark ? 'text-white' : 'text-gray-800'}`}
                  placeholderTextColor="#9CA3AF"
                />
                {name.length > 0 && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </View>
            </View>

            {/* Email Input */}
            <View>
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-semibold mb-2 ml-1 mt-2`}>
                Email Address
              </Text>
              <View className={`flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-white'} ${
                emailFocused ? 'border-2 border-purple-500' : 'border border-gray-200'
              } rounded-2xl px-4 shadow-sm`}>
                <Ionicons 
                  name="mail" 
                  size={20} 
                  color={emailFocused ? '#8B5CF6' : '#9CA3AF'} 
                />
                <TextInput
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => {
                    setEmailFocused(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  onBlur={() => setEmailFocused(false)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className={`flex-1 p-4 ${isDark ? 'text-white' : 'text-gray-800'}`}
                  placeholderTextColor="#9CA3AF"
                />
                {email.length > 0 && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </View>
            </View>

            {/* Password Input */}
            <View>
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-semibold mb-2 ml-1 mt-2`}>
                Password
              </Text>
              <View className={`flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-white'} ${
                passwordFocused ? 'border-2 border-purple-500' : 'border border-gray-200'
              } rounded-2xl px-4 shadow-sm`}>
                <Ionicons 
                  name="lock-closed" 
                  size={20} 
                  color={passwordFocused ? '#8B5CF6' : '#9CA3AF'} 
                />
                <TextInput
                  placeholder="Create a password (min 6 chars)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => {
                    setPasswordFocused(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  onBlur={() => setPasswordFocused(false)}
                  className={`flex-1 p-4 ${isDark ? 'text-white' : 'text-gray-800'}`}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity 
                  onPress={() => {
                    setShowPassword(!showPassword);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons 
                    name={showPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View>
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-semibold mb-2 ml-1 mt-2`}>
                Confirm Password
              </Text>
              <View className={`flex-row items-center ${isDark ? 'bg-gray-800' : 'bg-white'} ${
                confirmPasswordFocused ? 'border-2 border-purple-500' : 'border border-gray-200'
              } rounded-2xl px-4 shadow-sm`}>
                <Ionicons 
                  name="lock-closed" 
                  size={20} 
                  color={confirmPasswordFocused ? '#8B5CF6' : '#9CA3AF'} 
                />
                <TextInput
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => {
                    setConfirmPasswordFocused(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  className={`flex-1 p-4 ${isDark ? 'text-white' : 'text-gray-800'}`}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity 
                  onPress={() => {
                    setShowConfirmPassword(!showConfirmPassword);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <Pressable
              onPress={handleButtonPress}
              disabled={loading}
              className={`mt-6 rounded-2xl shadow-lg w-full ${loading ? 'opacity-70 bg-purple-400' : 'bg-purple-500'}`}
              style={{ paddingVertical: 16, paddingHorizontal: 24 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Text className="text-white text-center font-bold text-lg mr-2">
                    Create Account
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </View>
              )}
            </Pressable>
          </View>

          {/* Footer Section */}
          <View className="mt-8">
            <View className="flex-row items-center justify-center">
              <View className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
              <Text className={`mx-4 ${isDark ? 'text-gray-500' : 'text-gray-500'} font-medium`}>
                Already a member?
              </Text>
              <View className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
            </View>

            <Pressable 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace("/auth/login");
              }}
              className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 p-4 rounded-2xl mt-6`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="log-in" size={20} color="#8B5CF6" />
                <Text className="text-purple-500 font-bold text-lg ml-2">
                  Sign In
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Terms Footer */}
          <View className="mt-6">
            <Text className={`text-center ${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs`}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
