/**
 * Input Validation Utilities
 * Provides common validation schemas and middleware
 */

import { z } from 'zod'

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  /**
   * Email validation
   */
  email: z.string().email('Invalid email address').toLowerCase(),

  /**
   * Strong password validation
   * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
   */
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),

  /**
   * Name validation
   */
  name: z
    .string()
    .min(2, 'Name too short')
    .max(100, 'Name too long')
    .trim(),

  /**
   * URL validation
   */
  url: z
    .string()
    .url('Invalid URL')
    .refine(
      (url) => ['http:', 'https:'].includes(new URL(url).protocol),
      'URL must be HTTP or HTTPS'
    ),

  /**
   * Monitor name
   */
  monitorName: z
    .string()
    .min(3, 'Monitor name must be at least 3 characters')
    .max(100, 'Monitor name too long')
    .trim(),

  /**
   * Monitor interval (in seconds)
   */
  monitorInterval: z
    .number()
    .min(60, 'Interval must be at least 60 seconds')
    .max(3600, 'Interval must be at most 3600 seconds'),

  /**
   * Pagination limit
   */
  limit: z
    .number()
    .min(1)
    .max(100)
    .default(50),

  /**
   * Pagination offset
   */
  offset: z
    .number()
    .min(0)
    .default(0),

  /**
   * Status enum
   */
  monitorStatus: z.enum(['UP', 'DOWN', 'SLOW']),

  /**
   * Incident status enum
   */
  incidentStatus: z.enum(['ONGOING', 'RESOLVED']),

  /**
   * Role enum
   */
  userRole: z.enum(['USER', 'ADMIN']),

  /**
   * Severity enum
   */
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
}

/**
 * Validate and parse request body
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema
): Promise<{ valid: boolean; data?: T; errors?: z.ZodError }> {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return { valid: false, errors: parsed.error }
    }

    return { valid: true, data: parsed.data as T }
  } catch (error) {
    return {
      valid: false,
      errors: new z.ZodError([
        {
          code: 'custom',
          message: 'Invalid JSON',
          path: [],
        },
      ]),
    }
  }
}

/**
 * Format validation errors for API response
 */
export function formatValidationErrors(errors: z.ZodError): string[] {
  return errors.errors.map((error) => {
    const path = error.path.join('.')
    return path
      ? `${path}: ${error.message}`
      : error.message
  })
}

/**
 * Safe integer parsing from string
 */
export function safeParseInt(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Sanitize string to prevent NoSQL injection
 */
export function sanitizeString(value: string): string {
  return value
    .replace(/[{}$]/g, '') // Remove NoSQL operators
    .trim()
}

/**
 * Validate ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-f]{24}$/.test(id.toLowerCase())
}
