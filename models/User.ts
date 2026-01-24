import { Schema, model, models, Document } from 'mongoose'

export interface UserDocument extends Document {
  name: string
  email: string
  passwordHash: string
  role: 'USER' | 'ADMIN'
  createdAt: Date
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

export const User = models.User || model<UserDocument>('User', UserSchema)

export default User
