import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { useCourseStore } from "../../store/courseStore";

export default function Profile() {
  const { user, logout, uploadAvatar, loading } = useAuthStore();
  const { bookmarkedCourses, enrolledCourses } = useCourseStore();
  const router = useRouter();
  const [localImage, setLocalImage] = useState<string | null>(null);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/auth/login");
          },
        },
      ]
    );
  };

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
      
      try {
        await uploadAvatar(imageUri);
        Alert.alert("Success", "Profile picture updated successfully!");
      } catch (error: any) {
        setLocalImage(null);
        Alert.alert("Error", error?.message || "Failed to update profile picture");
      }
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
      
      try {
        await uploadAvatar(imageUri);
        Alert.alert("Success", "Profile picture updated successfully!");
      } catch (error: any) {
        setLocalImage(null);
        Alert.alert("Error", error?.message || "Failed to update profile picture");
      }
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

  const avatarUrl = localImage || user?.avatar?.url || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&size=200&background=3B82F6&color=fff`;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="bg-blue-500 pt-16 pb-24 px-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-2xl font-bold">Profile</Text>
          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-white/20 p-2 rounded-full"
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Card */}
      <View className="px-6 -mt-16">
        <View className="bg-white rounded-3xl shadow-lg p-6">
          {/* Profile Image */}
          <View className="items-center -mt-16 mb-4">
            <View style={{ position: 'relative' }}>
              {loading ? (
                <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center border-4 border-white shadow-lg">
                  <ActivityIndicator size="large" color="#3B82F6" />
                </View>
              ) : (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
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
          </View>

          {/* User Info */}
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800 mb-1">
              {user?.username || "User"}
            </Text>
            <Text className="text-gray-500 text-base">
              {user?.email || "user@example.com"}
            </Text>
            <View className="bg-blue-100 px-4 py-2 rounded-full mt-3">
              <Text className="text-blue-600 font-semibold">
                {user?.role || "Student"}
              </Text>
            </View>
          </View>

          {/* Statistics */}
          <View className="flex-row justify-around py-6 border-t border-gray-100">
            <View className="items-center">
              <View className="bg-blue-50 w-16 h-16 rounded-full items-center justify-center mb-2">
                <Ionicons name="bookmark" size={28} color="#3B82F6" />
              </View>
              <Text className="font-bold text-xl text-gray-800">{bookmarkedCourses.length}</Text>
              <Text className="text-gray-500 text-sm">Bookmarks</Text>
            </View>

            <View className="items-center">
              <View className="bg-green-50 w-16 h-16 rounded-full items-center justify-center mb-2">
                <Ionicons name="checkmark-circle" size={28} color="#10B981" />
              </View>
              <Text className="font-bold text-xl text-gray-800">{enrolledCourses.length}</Text>
              <Text className="text-gray-500 text-sm">Enrolled</Text>
            </View>

            <View className="items-center">
              <View className="bg-purple-50 w-16 h-16 rounded-full items-center justify-center mb-2">
                <Ionicons name="school" size={28} color="#8B5CF6" />
              </View>
              <Text className="font-bold text-xl text-gray-800">{enrolledCourses.length > 0 ? Math.round((enrolledCourses.length / 20) * 100) : 0}%</Text>
              <Text className="text-gray-500 text-sm">Progress</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white rounded-3xl shadow-lg mt-6 p-4">
          <TouchableOpacity
            onPress={() => router.push("/profile/edit")} 
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="bg-blue-50 p-3 rounded-full mr-4">
              <Ionicons name="person-outline" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">Edit Profile</Text>
              <Text className="text-gray-500 text-sm">Update your information</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/profile/enrolled")} 
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="bg-blue-50 p-3 rounded-full mr-4">
              <Ionicons name="school-outline" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">My Courses</Text>
              <Text className="text-gray-500 text-sm">
                {enrolledCourses.length} {enrolledCourses.length === 1 ? 'course' : 'courses'} enrolled
              </Text>
            </View>
            <View className="flex-row items-center">
              {enrolledCourses.length > 0 && (
                <View className="bg-blue-100 px-2 py-1 rounded-full mr-2">
                  <Text className="text-blue-600 font-bold text-xs">
                    {enrolledCourses.length}
                  </Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/profile/bookmarks")}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="bg-green-50 p-3 rounded-full mr-4">
              <Ionicons name="bookmark-outline" size={24} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">My Bookmarks</Text>
              <Text className="text-gray-500 text-sm">
                {bookmarkedCourses.length} {bookmarkedCourses.length === 1 ? 'course' : 'courses'} saved
              </Text>
            </View>
            <View className="flex-row items-center">
              {bookmarkedCourses.length > 0 && (
                <View className="bg-green-100 px-2 py-1 rounded-full mr-2">
                  <Text className="text-green-600 font-bold text-xs">
                    {bookmarkedCourses.length}
                  </Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="bg-purple-50 p-3 rounded-full mr-4">
              <Ionicons name="settings-outline" size={24} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">Settings</Text>
              <Text className="text-gray-500 text-sm">App preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4">
            <View className="bg-orange-50 p-3 rounded-full mr-4">
              <Ionicons name="help-circle-outline" size={24} color="#F97316" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-semibold text-base">Help & Support</Text>
              <Text className="text-gray-500 text-sm">Get assistance</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Pressable 
          onPress={handleLogout}
          className="bg-red-50 rounded-3xl p-4 mt-6 mb-8 flex-row items-center justify-center"
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="text-red-500 font-bold text-lg ml-2">Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
