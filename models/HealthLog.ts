import { Schema, model, models, Document, Types } from 'mongoose'

export interface HealthLogDocument extends Document {
  monitorId: Types.ObjectId
  statusCode: number | null
  responseTime: number | null
  isUp: boolean
  checkedAt: Date
}

const HealthLogSchema = new Schema<HealthLogDocument>(
  {
    monitorId: { type: Schema.Types.ObjectId, ref: 'Monitor', required: true },
    statusCode: { type: Number },
    responseTime: { type: Number },
    isUp: { type: Boolean, required: true },
    checkedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

export const HealthLog = models.HealthLog || model<HealthLogDocument>('HealthLog', HealthLogSchema)

export default HealthLog
