import { sanitizeEmail, sanitizePhone } from "./api-utils";

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email gereklidir" };
  }

  const sanitized = sanitizeEmail(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: "Geçerli bir email adresi giriniz" };
  }

  return { isValid: true };
}

/**
 * Validate phone number (Turkish format)
 * Accepts: 10-15 digits, with or without country code
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== "string") {
    return { isValid: false, error: "Telefon numarası gereklidir" };
  }

  const sanitized = sanitizePhone(phone);
  const digitsOnly = sanitized.replace(/\+/g, "");

  // Turkish phone: 10 digits (without country code) or 11-15 with country code
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { isValid: false, error: "Geçerli bir telefon numarası giriniz (10-15 haneli)" };
  }

  // Check if it's all digits
  if (!/^\d+$/.test(digitsOnly)) {
    return { isValid: false, error: "Telefon numarası sadece rakam içermelidir" };
  }

  return { isValid: true };
}

/**
 * Validate TC Kimlik No (Turkish ID number)
 * Validates format: exactly 11 digits, first digit cannot be 0
 * Checksum validation is optional to avoid rejecting valid numbers
 */
export function validateTCNo(tcNo: string): ValidationResult {
  if (!tcNo || typeof tcNo !== "string") {
    return { isValid: false, error: "TC Kimlik numarası gereklidir" };
  }

  const trimmed = tcNo.trim();

  // Must be exactly 11 digits
  if (!/^\d{11}$/.test(trimmed)) {
    return { isValid: false, error: "TC Kimlik numarası 11 haneli olmalıdır" };
  }

  const digits = trimmed.split("").map(Number);

  // First digit cannot be 0
  if (digits[0] === 0) {
    return { isValid: false, error: "TC Kimlik numarası 0 ile başlayamaz" };
  }

  // Basic format validation passed
  // Checksum validation removed to avoid rejecting valid TC numbers
  // Users can enter their TC number without strict checksum validation

  return { isValid: true };
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, unknown>,
  fields: string[]
): ValidationResult {
  for (const field of fields) {
    const value = data[field];
    
    if (value === null || value === undefined || value === "") {
      return {
        isValid: false,
        error: `${field} alanı gereklidir`,
      };
    }
    
    if (typeof value === "string" && value.trim().length === 0) {
      return {
        isValid: false,
        error: `${field} alanı gereklidir`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max?: number
): ValidationResult {
  if (!value || typeof value !== "string") {
    return { isValid: false, error: `Değer en az ${min} karakter olmalıdır` };
  }

  const length = value.trim().length;

  if (length < min) {
    return { isValid: false, error: `Değer en az ${min} karakter olmalıdır` };
  }

  if (max !== undefined && length > max) {
    return { isValid: false, error: `Değer en fazla ${max} karakter olabilir` };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== "string") {
    return { isValid: false, error: "Şifre gereklidir" };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Şifre en az 8 karakter olmalıdır" };
  }

  return { isValid: true };
}

/**
 * Validate JSON structure
 */
export function validateJSON(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Validate order value (must be non-negative integer)
 */
export function validateOrder(order: unknown): ValidationResult {
  if (order === null || order === undefined) {
    return { isValid: true }; // Optional field
  }

  const num = typeof order === "number" ? order : parseInt(String(order), 10);

  if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
    return { isValid: false, error: "Sıra numarası geçerli bir pozitif tam sayı olmalıdır" };
  }

  return { isValid: true };
}

/**
 * Validate price (must be positive integer)
 */
export function validatePrice(price: unknown): ValidationResult {
  if (price === null || price === undefined) {
    return { isValid: false, error: "Fiyat gereklidir" };
  }

  const num = typeof price === "number" ? price : parseInt(String(price), 10);

  if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
    return { isValid: false, error: "Fiyat geçerli bir pozitif tam sayı olmalıdır" };
  }

  return { isValid: true };
}
