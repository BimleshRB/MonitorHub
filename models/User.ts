import { Schema, model, models, Document } from 'mongoose'

export interface NotificationPreferences {
  emailAlerts?: boolean
  slackAlerts?: boolean
  smsAlerts?: boolean
  weeklyReport?: boolean
  incident?: boolean
  maintenance?: boolean
}

export interface UserDocument extends Document {
  name: string
  email: string
  passwordHash: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
  notificationPreferences?: NotificationPreferences
  lastLogin?: Date
  lastRefreshToken?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    isActive: { type: Boolean, default: true },
    notificationPreferences: {
      type: {
        emailAlerts: { type: Boolean, default: true },
        slackAlerts: { type: Boolean, default: false },
        smsAlerts: { type: Boolean, default: false },
        weeklyReport: { type: Boolean, default: true },
        incident: { type: Boolean, default: true },
        maintenance: { type: Boolean, default: true },
      },
      default: {},
    },
    lastLogin: { type: Date },
    lastRefreshToken: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

// Indexes for performance
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ createdAt: -1 })

export const User = models.User || model<UserDocument>('User', UserSchema)

export default User
