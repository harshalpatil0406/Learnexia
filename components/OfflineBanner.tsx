
// import { Ionicons } from "@expo/vector-icons";
// import React from "react";
// import { Platform, Text, View } from "react-native";
// import Animated, {
//   SlideInDown,
//   SlideOutUp,
//   useAnimatedStyle,
//   useSharedValue,
//   withRepeat,
//   withSequence,
//   withTiming
// } from "react-native-reanimated";
// import { useNetworkStatus } from "../hooks/useNetworkStatus";

// export const OfflineBanner: React.FC = () => {
//   const { isOffline } = useNetworkStatus();
//   const opacity = useSharedValue(1);

//   React.useEffect(() => {
//     if (isOffline) {
//       // Pulse animation for the dot
//       opacity.value = withRepeat(
//         withSequence(
//           withTiming(0.3, { duration: 800 }),
//           withTiming(1, { duration: 800 })
//         ),
//         -1,
//         false
//       );
//     }
//   }, [isOffline]);

//   const dotStyle = useAnimatedStyle(() => ({
//     opacity: opacity.value,
//   }));

//   if (!isOffline) return null;

//   const topPadding = Platform.OS === "ios" ? 50 : 30;

//   return (
//     <Animated.View
//       entering={SlideInDown.duration(400).springify()}
//       exiting={SlideOutUp.duration(300)}
//       style={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         right: 0,
//         zIndex: 9999,
//         paddingTop: topPadding,
//         elevation: 10,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//       }}
//     >
//       <View className="bg-amber-500 mx-3 rounded-2xl overflow-hidden">
//         <View className="flex-row items-center px-4 py-3">
//           {/* Icon */}
//           <View className="bg-white/20 rounded-full p-2 mr-3">
//             <Ionicons name="cloud-offline-outline" size={20} color="white" />
//           </View>

//           {/* Text */}
//           <View className="flex-1">
//             <Text className="text-white font-bold text-sm">
//               No Internet Connection
//             </Text>
//             <Text className="text-white/80 text-xs mt-0.5">
//               Check your connection and try again
//             </Text>
//           </View>

//           {/* Pulsing Dot */}
//           <Animated.View
//             style={[dotStyle]}
//             className="w-2 h-2 rounded-full bg-white"
//           />
//         </View>
//       </View>
//     </Animated.View>
//   );
// };









import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Text, View } from "react-native";
import Animated, {
  SlideInDown,
  SlideOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export const OfflineBanner: React.FC = () => {
  const { isOffline } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(1);
  const [showBanner, setShowBanner] = React.useState(false);
  const [isOnlineMessage, setIsOnlineMessage] = React.useState(false);
  const previousOfflineState = React.useRef(isOffline);

  React.useEffect(() => {
    // Check if connection status changed from offline to online
    if (previousOfflineState.current === true && isOffline === false) {
      // Show "Back Online" message
      setIsOnlineMessage(true);
      setShowBanner(true);
      
      // Hide banner after 2 seconds
      const timer = setTimeout(() => {
        setShowBanner(false);
        setIsOnlineMessage(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else if (isOffline) {
      // Show offline message
      setIsOnlineMessage(false);
      setShowBanner(true);
      
      // Pulse animation for the dot
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      setShowBanner(false);
    }
    
    previousOfflineState.current = isOffline;
  }, [isOffline]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!showBanner) return null;

  // Dynamic top padding based on safe area insets
  const topPadding = insets.top > 0 ? insets.top + 8 : Platform.OS === "ios" ? 50 : 10;

  return (
    <Animated.View
      entering={SlideInDown.duration(400).springify()}
      exiting={SlideOutUp.duration(300)}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingTop: topPadding,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
    >
      <View className={`${isOnlineMessage ? 'bg-green-500' : 'bg-amber-500'} mx-3 rounded-2xl overflow-hidden`}>
        <View className="flex-row items-center px-4 py-3">
          {/* Icon */}
          <View className="bg-white/20 rounded-full p-2 mr-3">
            <Ionicons 
              name={isOnlineMessage ? "checkmark-circle-outline" : "cloud-offline-outline"} 
              size={20} 
              color="white" 
            />
          </View>

          {/* Text */}
          <View className="flex-1">
            <Text className="text-white font-bold text-sm">
              {isOnlineMessage ? "Back Online" : "No Internet Connection"}
            </Text>
            <Text className="text-white/80 text-xs mt-0.5">
              {isOnlineMessage ? "Connection restored successfully" : "Check your connection and try again"}
            </Text>
          </View>

          {/* Pulsing Dot (only for offline) */}
          {!isOnlineMessage && (
            <Animated.View
              style={[dotStyle]}
              className="w-2 h-2 rounded-full bg-white"
            />
          )}
          
          {/* Checkmark (only for online) */}
          {isOnlineMessage && (
            <View className="bg-white/20 rounded-full p-1">
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};