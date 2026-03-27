import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import WebView from "react-native-webview";
import { useCourseStore } from "../../../store/courseStore";

export default function CourseWebView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const { courses } = useCourseStore();
  const [loading, setLoading] = useState(true);

  const course = courses.find((c) => c.id === id);

  useEffect(() => {
    // Send course data to WebView once it's loaded
    if (course && webViewRef.current && !loading) {
      sendDataToWebView();
    }
  }, [course, loading]);

  const sendDataToWebView = () => {
    if (!course || !webViewRef.current) return;

    const courseData = {
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      instructor: course.instructor,
      message: `Loaded from React Native at ${new Date().toLocaleTimeString()}`,
    };

    // Send data to WebView using postMessage
    const jsCode = `
      window.loadCourseData(${JSON.stringify(courseData)});
      true;
    `;

    webViewRef.current.injectJavaScript(jsCode);
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleSendMessage = () => {
    if (!webViewRef.current) return;

    const message = {
      message: `Message sent at ${new Date().toLocaleTimeString()}`,
      type: "notification",
    };

    const jsCode = `
      document.getElementById('messageContent').textContent = '${message.message}';
      document.getElementById('nativeMessage').classList.add('show');
      true;
    `;

    webViewRef.current.injectJavaScript(jsCode);

    Alert.alert("Success", "Message sent to WebView!");
  };

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-500 text-lg mt-4">Course not found</Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-blue-500 px-6 py-3 rounded-full mt-6"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Read the HTML template
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Course Content</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: #333;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .course-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .course-category {
            display: inline-block;
            background: #dbeafe;
            color: #2563eb;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }
        
        .instructor-info {
            display: flex;
            align-items: center;
            background: #f9fafb;
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .instructor-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin-right: 15px;
            border: 3px solid #3b82f6;
        }
        
        .instructor-details h3 {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 5px;
        }
        
        .instructor-details p {
            color: #6b7280;
            font-size: 14px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .section-title::before {
            content: '';
            width: 4px;
            height: 24px;
            background: #3b82f6;
            margin-right: 10px;
            border-radius: 2px;
        }
        
        .description {
            color: #4b5563;
            line-height: 1.8;
            font-size: 16px;
        }
        
        .lessons-list {
            list-style: none;
        }
        
        .lesson-item {
            background: #f9fafb;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
        }
        
        .lesson-number {
            background: #3b82f6;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
            font-size: 14px;
        }
        
        .lesson-title {
            flex: 1;
            color: #1f2937;
            font-weight: 500;
        }
        
        .lesson-duration {
            color: #6b7280;
            font-size: 14px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            border-radius: 15px;
            text-align: center;
            color: white;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 12px;
            opacity: 0.9;
        }
        
        .price-tag {
            background: #10b981;
            color: white;
            padding: 15px 30px;
            border-radius: 15px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            margin-top: 20px;
        }
        
        .message-from-native {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            display: none;
        }
        
        .message-from-native.show {
            display: block;
        }
        
        .message-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 5px;
        }
        
        .message-content {
            color: #78350f;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="course-title" id="courseTitle">${course.title}</h1>
            <span class="course-category" id="courseCategory">${course.category}</span>
        </div>
        
        <div class="instructor-info">
            <img id="instructorAvatar" src="${course.instructor?.avatar || ''}" alt="Instructor" class="instructor-avatar">
            <div class="instructor-details">
                <h3 id="instructorName">${course.instructor?.name || 'Unknown'}</h3>
                <p id="instructorEmail">${course.instructor?.email || ''}</p>
            </div>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">12h</div>
                <div class="stat-label">Duration</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">24</div>
                <div class="stat-label">Lessons</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">1.2k</div>
                <div class="stat-label">Students</div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">About This Course</h2>
            <p class="description" id="courseDescription">
                ${course.description}
            </p>
        </div>
        
        <div class="section">
            <h2 class="section-title">Course Curriculum</h2>
            <ul class="lessons-list">
                <li class="lesson-item">
                    <div class="lesson-number">1</div>
                    <div class="lesson-title">Introduction and Getting Started</div>
                    <div class="lesson-duration">45 min</div>
                </li>
                <li class="lesson-item">
                    <div class="lesson-number">2</div>
                    <div class="lesson-title">Core Concepts and Fundamentals</div>
                    <div class="lesson-duration">60 min</div>
                </li>
                <li class="lesson-item">
                    <div class="lesson-number">3</div>
                    <div class="lesson-title">Practical Examples and Use Cases</div>
                    <div class="lesson-duration">75 min</div>
                </li>
                <li class="lesson-item">
                    <div class="lesson-number">4</div>
                    <div class="lesson-title">Advanced Techniques</div>
                    <div class="lesson-duration">90 min</div>
                </li>
                <li class="lesson-item">
                    <div class="lesson-number">5</div>
                    <div class="lesson-title">Building Real-World Projects</div>
                    <div class="lesson-duration">120 min</div>
                </li>
            </ul>
        </div>
        
        <div class="price-tag" id="coursePrice">
            $${course.price}
        </div>
        
        <div class="message-from-native" id="nativeMessage">
            <div class="message-title">Message from App</div>
            <div class="message-content" id="messageContent"></div>
        </div>
    </div>
    
    <script>
        function loadCourseData(courseData) {
            try {
                const data = typeof courseData === 'string' ? JSON.parse(courseData) : courseData;
                
                if (data.title) document.getElementById('courseTitle').textContent = data.title;
                if (data.category) document.getElementById('courseCategory').textContent = data.category;
                if (data.description) document.getElementById('courseDescription').textContent = data.description;
                if (data.price) document.getElementById('coursePrice').textContent = '$' + data.price;
                
                if (data.instructor) {
                    if (data.instructor.name) document.getElementById('instructorName').textContent = data.instructor.name;
                    if (data.instructor.email) document.getElementById('instructorEmail').textContent = data.instructor.email;
                    if (data.instructor.avatar) document.getElementById('instructorAvatar').src = data.instructor.avatar;
                }
                
                if (data.message) {
                    const messageDiv = document.getElementById('nativeMessage');
                    document.getElementById('messageContent').textContent = data.message;
                    messageDiv.classList.add('show');
                }
            } catch (error) {
                console.error('Error loading course data:', error);
            }
        }
        
        window.addEventListener('message', function(event) {
            if (event.data) {
                loadCourseData(event.data);
            }
        });
        
        document.addEventListener('message', function(event) {
            if (event.data) {
                loadCourseData(event.data);
            }
        });
    </script>
</body>
</html>
  `;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-500 pt-14 pb-4 px-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="bg-white/20 p-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>

        <Text className="text-white text-lg font-bold flex-1 text-center">
          Course Content
        </Text>

        <View className="flex-row">
          <Pressable
            onPress={handleRefresh}
            className="bg-white/20 p-2 rounded-full mr-2"
          >
            <Ionicons name="refresh" size={24} color="white" />
          </Pressable>

          <Pressable
            onPress={handleSendMessage}
            className="bg-white/20 p-2 rounded-full"
          >
            <Ionicons name="send" size={24} color="white" />
          </Pressable>
        </View>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          setLoading(false);
          // Send initial data after WebView loads
          setTimeout(() => sendDataToWebView(), 500);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-600 mt-4">Loading content...</Text>
          </View>
        )}
      />
    </View>
  );
}
