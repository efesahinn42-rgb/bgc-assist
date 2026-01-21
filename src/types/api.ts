/**
 * Standard API response types
 * Ensures consistency across all API endpoints
 */

/**
 * Standard success response
 */
export interface ApiSuccessResponse<T = unknown> {
  data?: T;
  message?: string;
  [key: string]: unknown;
}

/**
 * Standard error response
 */
export interface ApiErrorResponse {
  error: string;
  field?: string;
  details?: unknown;
  [key: string]: unknown;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  [key: string]: unknown;
}

/**
 * Application list response with polling support
 */
export interface ApplicationListResponse {
  applications: unknown[];
  pagination: PaginationMeta;
  hasNewData?: boolean;
  newCount?: number;
}

/**
 * Request body types
 */
export interface CreatePackageRequest {
  name: string;
  price: number | string;
  period: string;
  description: string;
  icon?: string;
  popular?: boolean;
  color?: string;
  features?: unknown[];
  notIncluded?: unknown[];
  isActive?: boolean;
}

export interface UpdatePackageRequest extends Partial<CreatePackageRequest> {
  order?: number;
}

export interface CreateServiceRequest {
  title: string;
  description: string;
  icon: string;
  color: string;
  modalImage?: string;
  modalDescription?: string;
  interventionTime?: string;
  coverageArea?: string;
  featuresList?: unknown[];
  isActive?: boolean;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  order?: number;
}

export interface CreateApplicationRequest {
  fullName: string;
  tcNo?: string;
  email?: string;
  phone: string;
  city?: string;
  district?: string;
  address?: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: string;
  packageName: string;
  packagePrice?: number | string;
}

export interface UpdateApplicationRequest {
  status?: string;
  notes?: string;
  assignedTo?: string;
}

/**
 * Session user type (extended from NextAuth)
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}
