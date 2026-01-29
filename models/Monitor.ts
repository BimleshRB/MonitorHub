import { Schema, model, models, Document, Types } from 'mongoose'

export interface MonitorDocument extends Document {
  userId: Types.ObjectId
  name: string
  url: string
  interval: number
  status: 'UP' | 'DOWN' | 'SLOW'
  lastCheckedAt?: Date
  isActive: boolean
  consecutiveFailures: number
  lastStatusCode?: number
  lastResponseTime?: number
  createdAt: Date
  updatedAt: Date
}

const MonitorSchema = new Schema<MonitorDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    interval: { type: Number, default: 60, min: 60, max: 3600 },
    status: { type: String, enum: ['UP', 'DOWN', 'SLOW'], default: 'UP' },
    isActive: { type: Boolean, default: true, index: true },
    consecutiveFailures: { type: Number, default: 0 },
    lastCheckedAt: { type: Date },
    lastStatusCode: { type: Number },
    lastResponseTime: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

// Indexes for performance
MonitorSchema.index({ userId: 1, createdAt: -1 })
MonitorSchema.index({ isActive: 1, lastCheckedAt: 1 })
MonitorSchema.index({ userId: 1, isActive: 1 })

export const Monitor = models.Monitor || model<MonitorDocument>('Monitor', MonitorSchema)

export default Monitor
