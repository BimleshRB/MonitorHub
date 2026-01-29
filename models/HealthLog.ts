import { Schema, model, models, Document, Types } from 'mongoose'

export interface HealthLogDocument extends Document {
  monitorId: Types.ObjectId
  statusCode?: number | null
  responseTime?: number | null
  isUp: boolean
  errorMessage?: string
  checkedAt: Date
}

const HealthLogSchema = new Schema<HealthLogDocument>(
  {
    monitorId: { type: Schema.Types.ObjectId, ref: 'Monitor', required: true, index: true },
    statusCode: { type: Number },
    responseTime: { type: Number },
    isUp: { type: Boolean, required: true },
    errorMessage: { type: String },
    checkedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
)

// Indexes for performance - TTL index to auto-delete old logs after 30 days
HealthLogSchema.index({ monitorId: 1, checkedAt: -1 })
HealthLogSchema.index({ checkedAt: 1 }, { expireAfterSeconds: 2592000 }) // 30 days

export const HealthLog = models.HealthLog || model<HealthLogDocument>('HealthLog', HealthLogSchema)

export default HealthLog
