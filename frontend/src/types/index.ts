// =============================================================================
// TYPE DEFINITIONS FOR SCHOOL MANAGEMENT SYSTEM
// =============================================================================

// -----------------------------------------------------------------------------
// User & Authentication Types
// -----------------------------------------------------------------------------

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
    id?: string;
    userId?: string;  // Backend profile endpoint returns userId
    email: string;
    name?: string;
    username?: string;  // Backend returns username
    role: UserRole | Role;  // Can be string or Role object
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Role and Permission types
export interface Permission {
    id: number;
    name: string;
    description?: string;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    permissions?: Permission[];
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    username: string;
    role?: UserRole;
}

export interface AuthResponse {
    access_token: string;
    user?: User;
}

export interface RefreshTokenResponse {
    access_token: string;
}

// -----------------------------------------------------------------------------
// School Entity Types
// -----------------------------------------------------------------------------

export interface Class {
    id: number;
    name?: string;
    class_name?: string;
    section?: string;
    teacherId?: number;
    teacher?: Teacher;
    students?: Student[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Student {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email: string;
    rollNumber?: string;
    roll_no?: string;
    classId?: number;
    class?: Class;
    userId?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Teacher {
    id: number;
    name?: string;
    email?: string;
    subject?: string;
    userId?: number;
    user?: {
        id: number;
        email: string;
        firstName?: string;
        lastName?: string;
        username?: string;
    };
    classes?: Class[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Attendance {
    id: number;
    date: string;
    status: 'present' | 'absent' | 'late';
    studentId: number;
    student?: Student;
    classId: number;
    class?: Class;
    createdAt?: string;
}

export interface Mark {
    id: number;
    subject: string;
    score: number;
    maxScore: number;
    examType?: string;
    studentId: number;
    student?: Student;
    classId?: number;
    createdAt?: string;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}
