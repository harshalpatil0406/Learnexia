import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

interface HomeSkeletonProps {
  isDark: boolean;
}

export function HomeSkeleton({ isDark }: HomeSkeletonProps) {
  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header Skeleton */}
      <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} pt-14 pb-4 px-6 shadow-sm`}>
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className={`${isDark ? 'text-white' : 'text-gray-800'} text-2xl font-bold`}>Learnexia</Text>
            <Text className={`${isDark ? 'text-white/70' : 'text-gray-500'} text-xs mt-0.5`}>Explore & Learn</Text>
          </View>
          <View className={`${isDark ? 'bg-white/20' : 'bg-blue-50'} px-3 py-1.5 rounded-full`}>
            <Text className={`${isDark ? 'text-white' : 'text-blue-600'} font-semibold text-xs`}>Loading...</Text>
          </View>
        </View>
        
        {/* Search Bar Skeleton */}
        <View className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl px-4 py-3 flex-row items-center`}>
          <Ionicons name="search" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'} />
          <View className={`flex-1 ml-3 h-4 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded`} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Carousel Skeleton */}
        <View className="px-4 pt-4">
          <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl h-48 overflow-hidden`}>
            <View className={`w-full h-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </View>
        </View>

        {/* Category Pills Skeleton */}
        <View className="px-4 py-4">
          <View className="flex-row">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-full px-4 py-2 mr-2`}>
                <View className={`w-16 h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`} />
              </View>
            ))}
          </View>
        </View>

        {/* Course Cards Skeleton */}
        <View className="px-4 pb-4">
          {[1, 2, 3].map((i) => (
            <View key={i} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl mb-4 overflow-hidden`}>
              {/* Image Skeleton */}
              <View className={`w-full h-48 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              
              {/* Content Skeleton */}
              <View className="p-4">
                {/* Category Badge */}
                <View className={`w-20 h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`} />
                
                {/* Title */}
                <View className={`w-full h-5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2`} />
                
                {/* Description */}
                <View className={`w-3/4 h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-3`} />
                
                {/* Footer */}
                <View className="flex-row items-center justify-between">
                  {/* Instructor */}
                  <View className="flex-row items-center">
                    <View className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} mr-2`} />
                    <View className={`w-24 h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`} />
                  </View>
                  
                  {/* Price */}
                  <View className={`w-16 h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
