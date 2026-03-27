export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  username: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  category: string;
  instructor?: Instructor;
  isBookmarked?: boolean;
  isEnrolled?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  success: boolean;
}
