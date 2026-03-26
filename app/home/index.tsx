// app/home/index.tsx

import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Dummy data (we will replace with API later)
  const courses = [
    { id: "1", title: "React Native Basics" },
    { id: "2", title: "Advanced JavaScript" },
    { id: "3", title: "AI Fundamentals" },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <View className="flex-1 bg-white px-4 pt-12">

      {/*  Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-lg text-gray-500">Welcome </Text>
          <Text className="text-xl font-bold">
            {user?.username || "User"}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/profile")}
          className="bg-gray-200 px-4 py-2 rounded-xl"
        >
          <Text>Profile</Text>
        </Pressable>
      </View>

      {/*  Section Title */}
      <Text className="text-lg font-semibold mb-4">
        Your Courses
      </Text>

      {/*  Course List */}
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Pressable
            className="bg-gray-100 p-4 rounded-xl mb-3"
          >
            <Text className="font-semibold text-base">
              {item.title}
            </Text>
          </Pressable>
        )}
      />

      {/* Logout Button */}
      <Pressable
        onPress={handleLogout}
        className="bg-red-500 p-4 rounded-xl mt-4"
      >
        <Text className="text-white text-center font-semibold">
          Logout
        </Text>
      </Pressable>
    </View>
  );
}