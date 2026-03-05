/**
 * Global TypeScript Type Definitions
 * Add your custom types here
 */

import { Request } from 'express';

// Express Request with User
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'pharmacist' | 'customer';
  };
}

// User Roles
export type UserRole = 'admin' | 'pharmacist' | 'customer';

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Database Models (will be expanded)
export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// AI Service Types
export interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  words?: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  lines?: Array<{
    text: string;
    confidence: number;
  }>;
  error?: string;
}

export interface ParsedPrescription {
  doctorName?: string;
  patientName?: string;
  date?: string;
  medicines: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }>;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  description: string;
  recommendation: string;
  source: string;
}

// Add more types as needed
