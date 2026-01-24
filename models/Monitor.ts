import { Schema, model, models, Document, Types } from 'mongoose'

export interface MonitorDocument extends Document {
  userId: Types.ObjectId
  name: string
  url: string
  interval: number
  status: 'UP' | 'DOWN'
  lastCheckedAt?: Date
  createdAt: Date
}

const MonitorSchema = new Schema<MonitorDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    interval: { type: Number, default: 60 },
    status: { type: String, enum: ['UP', 'DOWN'], default: 'UP' },
    lastCheckedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

export const Monitor = models.Monitor || model<MonitorDocument>('Monitor', MonitorSchema)

export default Monitor
