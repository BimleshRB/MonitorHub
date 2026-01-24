import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/monitor-hub'

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

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const options: mongoose.ConnectOptions = {
      bufferCommands: false,
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .catch((err) => {
        console.error('MongoDB connection failed:', err.message)
        console.warn('Using fallback: some features may not work without MongoDB')
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

export default connectToDatabase
