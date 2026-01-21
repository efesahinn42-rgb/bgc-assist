import { NextResponse } from "next/server";

/**
 * Generate URL-friendly slug from Turkish text
 * Handles Turkish characters and special cases
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate unique slug by appending timestamp if slug exists
 */
export async function generateUniqueSlug(
  baseText: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = generateSlug(baseText);
  const exists = await checkExists(baseSlug);

  if (!exists) {
    return baseSlug;
  }

  return `${baseSlug}-${Date.now()}`;
}

/**
 * Sanitize string input - remove dangerous characters and trim
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""); // Remove script tags
}

/**
 * Sanitize phone number - remove non-digit characters except +
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== "string") {
    return "";
  }

  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, "");
}

/**
 * Sanitize email - basic validation and trim
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
}

/**
 * Sanitize plate number - uppercase and remove spaces
 */
export function sanitizePlate(plate: string): string {
  if (!plate || typeof plate !== "string") {
    return "";
  }

  return plate.replace(/\s+/g, "").toUpperCase();
}

/**
 * Standard API error response
 */
export function apiError(
  message: string,
  status: number = 500,
  details?: unknown
): NextResponse {
  const responseBody: Record<string, unknown> = { error: message };
  if (details) {
    responseBody.details = details;
  }

  return NextResponse.json(responseBody, { status });
}

/**
 * Standard API success response
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Standard API validation error response
 */
export function apiValidationError(
  field: string,
  message: string
): NextResponse {
  return NextResponse.json(
    {
      error: "Validation error",
      field,
      message,
    },
    { status: 400 }
  );
}

/**
 * Check if value is empty or null
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * Parse integer safely with default value
 */
export function parseIntSafe(value: unknown, defaultValue: number = 0): number {
  if (typeof value === "number") {
    return Math.floor(value);
  }

  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  return defaultValue;
}

/**
 * Get max order value for ordering
 */
export async function getMaxOrder<T extends { order: number }>(
  aggregateFn: () => Promise<{ _max: { order: number | null } }>
): Promise<number> {
  const result = await aggregateFn();
  return (result._max.order ?? 0) + 1;
}
