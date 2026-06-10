import mongoose from 'mongoose'

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return

  mongoose.set('strictQuery', true)

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  }
}
