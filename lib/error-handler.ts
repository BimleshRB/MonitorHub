/**
 * Error Handling Utility
 * Provides consistent error responses across the API
 */

import { NextResponse } from 'next/server'

export interface ApiErrorResponse {
  success: false
  message: string
  code: string
  details?: any
}

export interface ApiSuccessResponse<T> {
  success: true
  data?: T
  message?: string
}

/**
 * Log error securely (don't log sensitive data)
 */
export function logError(error: any, context: string): void {
  if (error instanceof Error) {
    console.error(`[${context}] ${error.message}`, {
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  } else {
    console.error(`[${context}] Unknown error:`, error)
  }
}

/**
 * Create error response
 */
export function createErrorResponse(
  message: string,
  code: string,
  statusCode: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {}),
    } as ApiErrorResponse,
    { status: statusCode }
  )
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message ? { message } : {}),
    } as ApiSuccessResponse<T>,
    { status: statusCode }
  )
}

/**
 * Common error responses
 */
export const ApiErrors = {
  UNAUTHORIZED: () =>
    createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401),

  FORBIDDEN: () =>
    createErrorResponse('Forbidden', 'FORBIDDEN', 403),

  NOT_FOUND: (resource = 'Resource') =>
    createErrorResponse(`${resource} not found`, 'NOT_FOUND', 404),

  VALIDATION_ERROR: (message = 'Validation failed') =>
    createErrorResponse(message, 'VALIDATION_ERROR', 400),

  CONFLICT: (message = 'Resource already exists') =>
    createErrorResponse(message, 'CONFLICT', 409),

  RATE_LIMIT: (retryAfter: number) => {
    const response = createErrorResponse(
      'Too many requests. Please try again later.',
      'RATE_LIMIT',
      429
    )
    response.headers.set('Retry-After', retryAfter.toString())
    return response
  },

  INTERNAL_ERROR: (isDev = false) =>
    createErrorResponse(
      isDev ? 'Internal server error' : 'An unexpected error occurred',
      'INTERNAL_ERROR',
      500
    ),

  SERVICE_UNAVAILABLE: () =>
    createErrorResponse('Service temporarily unavailable', 'SERVICE_UNAVAILABLE', 503),
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandler<T extends any[], R extends NextResponse>(
  handler: (...args: T) => Promise<R> | R
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args)
    } catch (error: any) {
      logError(error, 'API Handler')

      // Don't expose internal error details in production
      if (error.message?.includes('Unauthorized')) {
        return ApiErrors.UNAUTHORIZED() as any
      }

      if (error.message?.includes('Forbidden')) {
        return ApiErrors.FORBIDDEN() as any
      }

      return ApiErrors.INTERNAL_ERROR(
        process.env.NODE_ENV === 'development'
      ) as any
    }
  }
}
