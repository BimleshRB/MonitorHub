/**
 * Environment Variable Validation
 * Ensures all required env vars are present on app startup
 * Fails fast if critical configuration is missing
 */

export function validateEnvironment(): void {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ]

  const optional = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'GEMINI_API_KEY',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASS',
    'CRON_SECRET',
  ]

  // Check required vars
  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'App cannot start without these critical configurations.'
    )
  }

  // Warn about optional vars
  const missingOptional = optional.filter((key) => !process.env[key])
  if (missingOptional.length > 0) {
    console.warn(
      `⚠️  Missing optional environment variables: ${missingOptional.join(', ')}\n` +
        '   Some features may not work properly.'
    )
  }

  // Validate specific formats
  const mongoUri = process.env.MONGODB_URI
  if (mongoUri && !mongoUri.startsWith('mongodb')) {
    throw new Error('MONGODB_URI must be a valid MongoDB connection string')
  }

  const jwtSecret = process.env.JWT_SECRET
  if (jwtSecret && jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }

  console.log('✅ Environment validation passed')
}

// Run validation on module load (for dev and production)
if (typeof window === 'undefined') {
  // Only validate on server-side
  try {
    validateEnvironment()
  } catch (error) {
    console.error('🚨 Environment validation failed:', error)
    // In production, exit the process
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}
