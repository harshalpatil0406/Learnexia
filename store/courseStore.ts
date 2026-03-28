import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { getCourses, getInstructors } from "../services/courseService";
import { notificationService } from "../services/notificationService";
import { Course, Instructor } from "../types/course";

// Helper functions to get user-specific storage keys
const getBookmarksKey = (userId: string) => `bookmarked_courses_${userId}`;
const getEnrolledKey = (userId: string) => `enrolled_courses_${userId}`;

interface CourseState {
  courses: Course[];
  instructors: Instructor[];
  bookmarkedCourses: string[];
  enrolledCourses: string[];
  loading: boolean;
  refreshing: boolean;
  searchQuery: string;
  currentUserId: string | null;
  fetchCourses: () => Promise<void>;
  toggleBookmark: (courseId: string) => Promise<void>;
  enrollCourse: (courseId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  getFilteredCourses: () => Course[];
  initializeStorage: (userId: string) => Promise<void>;
  clearUserData: () => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  instructors: [],
  bookmarkedCourses: [],
  enrolledCourses: [],
  loading: false,
  refreshing: false,
  searchQuery: "",
  currentUserId: null,

  fetchCourses: async () => {
    try {
      console.log("Starting to fetch courses...");
      set({ loading: true });

      // Fetch instructors and courses in parallel
      const [instructorsRes, coursesRes] = await Promise.all([
        getInstructors(1, 20),
        getCourses(1, 20),
      ]);

      console.log("Instructors data:", instructorsRes);
      console.log("Courses data:", coursesRes);

      const instructors = instructorsRes.data?.data || [];
      const coursesData = coursesRes.data?.data || [];

      console.log("Parsed instructors:", instructors.length);
      console.log("Parsed courses:", coursesData.length);

      // Map courses with instructors
      const courses: Course[] = coursesData.map((product: any, index: number) => {
        const instructor = instructors[index % instructors.length];
        
        // Use educational-themed Unsplash images
        const educationalImages = [
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80", // laptop coding
          "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80", // books and coffee
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", // people studying
          "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&q=80", // macbook desk
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80", // classroom
          "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80", // person with laptop
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80", // team working
          "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80", // laptop on desk
          "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80", // books stack
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80", // notebook and pen
          "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80", // books on shelf
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80", // desk with notes
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80", // students studying
          "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80", // library
          "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80", // online learning
          "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80", // workspace
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80", // team collaboration
          "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&q=80", // study desk
          "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80", // education concept
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80", // coding screen
        ];
        
        const thumbnail = educationalImages[index % educationalImages.length];
        
        const course = {
          id: product.id?.toString() || `course-${index}`,
          title: product.title || "Untitled Course",
          description: product.description || "No description available",
          thumbnail: thumbnail,
          price: product.price || 0,
          category: product.category || product.brand || "General",
          instructor: instructor ? {
            id: instructor.id?.toString() || `instructor-${index}`,
            name: `${instructor.name?.first || ''} ${instructor.name?.last || ''}`.trim() || "Unknown",
            email: instructor.email || "",
            avatar: instructor.picture?.large || instructor.picture?.medium || "https://i.pravatar.cc/150?img=" + (index + 1),
            username: instructor.login?.username || "user",
          } : undefined,
        };
        
        console.log(`Course ${index}:`, {
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail,
        });
        
        return course;
      });

      console.log("Mapped courses:", courses.length);

      const { bookmarkedCourses, enrolledCourses } = get();

      // Add bookmark and enrollment status
      const coursesWithStatus = courses.map((course) => ({
        ...course,
        isBookmarked: bookmarkedCourses.includes(course.id),
        isEnrolled: enrolledCourses.includes(course.id),
      }));

      console.log("Final courses with status:", coursesWithStatus.length);

      set({
        courses: coursesWithStatus,
        instructors,
        loading: false,
        refreshing: false,
      });
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      set({ loading: false, refreshing: false });
      throw error;
    }
  },

  toggleBookmark: async (courseId: string) => {
    console.log("toggleBookmark called for:", courseId);
    const { bookmarkedCourses, courses, currentUserId } = get();
    
    if (!currentUserId) {
      console.error("No user logged in");
      return;
    }
    
    const isBookmarked = bookmarkedCourses.includes(courseId);
    console.log("Current bookmark status:", isBookmarked);
    console.log("Current courses length:", courses.length);

    let updatedBookmarks: string[];
    if (isBookmarked) {
      updatedBookmarks = bookmarkedCourses.filter((id) => id !== courseId);
    } else {
      updatedBookmarks = [...bookmarkedCourses, courseId];
      
      // Show notification when user bookmarks 5+ courses
      if (updatedBookmarks.length === 5) {
        await notificationService.showBookmarkMilestoneNotification(5);
      } else if (updatedBookmarks.length === 10) {
        await notificationService.showBookmarkMilestoneNotification(10);
      } else if (updatedBookmarks.length === 20) {
        await notificationService.showBookmarkMilestoneNotification(20);
      }
    }

    console.log("Updated bookmarks:", updatedBookmarks);

    // Update courses with new bookmark status - CREATE NEW ARRAY
    const updatedCourses = courses.map((course) =>
      course.id === courseId
        ? { ...course, isBookmarked: !isBookmarked }
        : course
    );

    console.log("Updated courses length:", updatedCourses.length);
    console.log("Course bookmark status:", updatedCourses.find(c => c.id === courseId)?.isBookmarked);

    // Use set with new object references to trigger re-render
    set({ 
      bookmarkedCourses: updatedBookmarks, 
      courses: updatedCourses 
    });

    // Persist to AsyncStorage with user-specific key
    try {
      await AsyncStorage.setItem(getBookmarksKey(currentUserId), JSON.stringify(updatedBookmarks));
      console.log("Bookmarks saved to storage for user:", currentUserId);
    } catch (error) {
      console.error("Failed to save bookmarks:", error);
    }
  },

  enrollCourse: async (courseId: string) => {
    const { enrolledCourses, courses, currentUserId } = get();

    if (!currentUserId) {
      console.error("No user logged in");
      return;
    }

    if (enrolledCourses.includes(courseId)) {
      return; // Already enrolled
    }

    const updatedEnrolled = [...enrolledCourses, courseId];

    // Update courses with enrollment status
    const updatedCourses = courses.map((course) =>
      course.id === courseId ? { ...course, isEnrolled: true } : course
    );

    set({ enrolledCourses: updatedEnrolled, courses: updatedCourses });

    // Persist to AsyncStorage with user-specific key
    try {
      await AsyncStorage.setItem(getEnrolledKey(currentUserId), JSON.stringify(updatedEnrolled));
      console.log("Enrollment saved to storage for user:", currentUserId);
    } catch (error) {
      console.error("Failed to save enrollment:", error);
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  getFilteredCourses: () => {
    const { courses, searchQuery } = get();

    if (!searchQuery.trim()) {
      return courses;
    }

    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.instructor?.name.toLowerCase().includes(query)
    );
  },

  initializeStorage: async (userId: string) => {
    try {
      console.log("Initializing storage for user:", userId);
      
      const [bookmarksStr, enrolledStr] = await Promise.all([
        AsyncStorage.getItem(getBookmarksKey(userId)),
        AsyncStorage.getItem(getEnrolledKey(userId)),
      ]);

      const bookmarkedCourses = bookmarksStr ? JSON.parse(bookmarksStr) : [];
      const enrolledCourses = enrolledStr ? JSON.parse(enrolledStr) : [];

      console.log("Loaded bookmarks:", bookmarkedCourses);
      console.log("Loaded enrollments:", enrolledCourses);

      set({ 
        bookmarkedCourses, 
        enrolledCourses,
        currentUserId: userId 
      });
      
      // Update courses with the loaded bookmark/enrollment status
      const { courses } = get();
      if (courses.length > 0) {
        const updatedCourses = courses.map((course) => ({
          ...course,
          isBookmarked: bookmarkedCourses.includes(course.id),
          isEnrolled: enrolledCourses.includes(course.id),
        }));
        set({ courses: updatedCourses });
      }
    } catch (error) {
      console.error("Failed to load storage:", error);
    }
  },

  clearUserData: async () => {
    console.log("Clearing user-specific course data");
    set({
      bookmarkedCourses: [],
      enrolledCourses: [],
      currentUserId: null,
      courses: [],
      instructors: [],
    });
  },
}));
