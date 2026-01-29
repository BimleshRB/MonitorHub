/**
 * MongoDB Connection Pool Manager
 * Maintains single connection for the entire app lifecycle
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

// Validate required env vars
if (!MONGODB_URI) {
  throw new Error(
    'MONGODB_URI is required but not set in environment variables'
  )
}

interface Cached {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalWithMongoose = globalThis as typeof globalThis & {
  _mongooseCache?: Cached
}

const cached: Cached = globalWithMongoose._mongooseCache || {
  conn: null,
  promise: null,
}

if (!globalWithMongoose._mongooseCache) {
  globalWithMongoose._mongooseCache = cached
}

/**
 * Connect to MongoDB with automatic retry
 * Uses connection pooling to minimize resource usage
 */
export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const options: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    }

    cached.promise = mongoose
      .connect(MONGODB_URI!, options)
      .then(() => {
        console.log('MongoDB connected successfully')
        return mongoose
      })
      .catch((err) => {
        console.error('MongoDB connection failed:', err.message)
        cached.promise = null
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    throw error
  }

  return cached.conn
}

/**
 * Disconnect from MongoDB (for graceful shutdown)
 */
export async function disconnectFromDatabase() {
  if (cached.conn) {
    await mongoose.disconnect()
    cached.conn = null
    cached.promise = null
  }
}

export default connectToDatabase

export default connectToDatabase
