// Shared types for FutureUp Academy

export interface Course {
  id: string;
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  descAz: string;
  descRu: string;
  descEn: string;
  shortDescAz?: string;
  shortDescRu?: string;
  shortDescEn?: string;
  image?: string;
  duration: string;
  price?: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  syllabus?: SyllabusModule[];
  features?: string[];
  category?: Category;
  teachers?: Teacher[];
}

export interface SyllabusModule {
  module: string;
  topics: string[];
  hours: number;
}

export interface Category {
  id: string;
  nameAz: string;
  nameRu: string;
  nameEn: string;
  slug: string;
  icon?: string;
}

export interface Teacher {
  id: string;
  nameAz: string;
  nameRu: string;
  nameEn: string;
  bioAz?: string;
  bioRu?: string;
  bioEn?: string;
  photo?: string;
  specialization?: string;
  linkedin?: string;
  github?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
}

export interface Certificate {
  id: string;
  uniqueCode: string;
  studentId: string;
  courseId: string;
  teacherId: string;
  issueDate: string;
  pdfUrl?: string;
  qrCodeUrl?: string;
  teacherReview?: string;
  grade?: string;
  status: 'ACTIVE' | 'REVOKED';
  student?: Student;
  course?: Course;
  teacher?: Teacher;
}

export interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseId?: string;
  message?: string;
  status: 'NEW' | 'CONTACTED' | 'ENROLLED' | 'REJECTED';
  notes?: string;
  course?: Course;
  createdAt: string;
}

export interface News {
  id: string;
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  contentAz: string;
  contentRu: string;
  contentEn: string;
  excerptAz?: string;
  excerptRu?: string;
  excerptEn?: string;
  image?: string;
  isPublished: boolean;
  publishedAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  photo?: string;
  textAz: string;
  textRu: string;
  textEn: string;
  rating: number;
  courseAz?: string;
  courseRu?: string;
  courseEn?: string;
}

export interface Review {
  id: string;
  type: 'STUDENT_ABOUT_COURSE' | 'STUDENT_ABOUT_TEACHER' | 'TEACHER_ABOUT_STUDENT';
  text: string;
  rating: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  studentAuthor?: Student;
  teacherAuthor?: Teacher;
  aboutCourse?: Course;
  aboutTeacher?: Teacher;
  aboutStudent?: Student;
  createdAt: string;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalTeachers: number;
  totalApplications: number;
  pendingReviews: number;
  recentApplications: Application[];
}
