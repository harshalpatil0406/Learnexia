import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../store/authStore";

export default function EditProfile() {
  const router = useRouter();
  const { user, uploadAvatar, updateUser, loading } = useAuthStore();
  
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const avatarUrl = localImage || user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&size=200&background=3B82F6&color=fff`;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need camera roll permissions to update your profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setLocalImage(imageUri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need camera permissions to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setLocalImage(imageUri);
    }
  };

  const handleImageUpdate = () => {
    Alert.alert(
      "Update Profile Picture",
      "Choose an option",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleSave = async () => {

    if (!username.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Email cannot be empty");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setSaving(true);

    try {

      if (localImage) {
        await uploadAvatar(localImage);
      }


      if (username !== user?.username || email !== user?.email) {
        await updateUser({ username, email });
      }
      
      Alert.alert(
        "Success",
        "Profile updated successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (localImage || username !== user?.username || email !== user?.email) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-500 pt-16 pb-6 px-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Pressable
              onPress={handleCancel}
              className="bg-white/20 p-2 rounded-full mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Text className="text-white text-3xl font-bold">
              Edit Profile
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 mt-4">
          {/* Profile Picture Section */}
          <View className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <Text className="text-gray-800 text-lg font-bold mb-4">
              Profile Picture
            </Text>
            
            <View className="items-center">
              <View style={{ position: 'relative' }}>
                {loading ? (
                  <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center border-4 border-white shadow-lg">
                    <ActivityIndicator size="large" color="#3B82F6" />
                  </View>
                ) : (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg"
                  />
                )}
                <TouchableOpacity 
                  onPress={handleImageUpdate}
                  className="bg-blue-500 p-3 rounded-full shadow-lg"
                  style={{ position: 'absolute', bottom: 0, right: 0 }}
                  disabled={loading}
                >
                  <Ionicons name="camera" size={20} color="white" />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-500 text-sm mt-4 text-center">
                Tap the camera icon to change your profile picture
              </Text>
            </View>
          </View>

          {/* Personal Information Section */}
          <View className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <Text className="text-gray-800 text-lg font-bold mb-4">
              Personal Information
            </Text>

            {/* Username Field */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Username</Text>
              <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  className="flex-1 ml-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Email Field */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">Email</Text>
              <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email"
                  className="flex-1 ml-3 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false}
                />
              </View>
            </View>

            {/* Role Field (Read-only) */}
            <View>
              <Text className="text-gray-700 font-semibold mb-2">Role</Text>
              <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200">
                <Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" />
                <Text className="flex-1 ml-3 text-gray-500">
                  {user?.role || "Student"}
                </Text>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-600 text-xs font-semibold">Read-only</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Account Information */}
          <View className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <Text className="text-gray-800 text-lg font-bold mb-4">
              Account Information
            </Text>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Account Created</Text>
              <Text className="text-gray-800 font-semibold">
                {new Date().toLocaleDateString()}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <Text className="text-gray-600">Account Status</Text>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-600 font-semibold text-xs">Active</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mb-8">
            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              disabled={saving || loading}
              className={`rounded-2xl p-4 mb-3 ${
                saving || loading ? "bg-blue-400" : "bg-blue-500"
              }`}
            >
              {saving ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator color="white" />
                  <Text className="text-white font-bold text-lg ml-2">
                    Saving...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text className="text-white font-bold text-lg ml-2">
                    Save Changes
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
