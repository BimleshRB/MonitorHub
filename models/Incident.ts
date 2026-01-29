import { Schema, model, models, Document, Types } from 'mongoose'

export interface IncidentDocument extends Document {
  monitorId: Types.ObjectId
  userId: Types.ObjectId
  startedAt: Date
  resolvedAt?: Date
  durationSeconds?: number
  status: 'ONGOING' | 'RESOLVED'
  severity?: 'LOW' | 'MEDIUM' | 'HIGH'
  aiExplanation?: string | null
  suggestedFix?: string | null
  failureCount: number
  createdAt: Date
  updatedAt: Date
}

const IncidentSchema = new Schema<IncidentDocument>(
  {
    monitorId: { type: Schema.Types.ObjectId, ref: 'Monitor', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    durationSeconds: { type: Number },
    status: { type: String, enum: ['ONGOING', 'RESOLVED'], default: 'ONGOING', index: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    aiExplanation: { type: String },
    suggestedFix: { type: String },
    failureCount: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

// Indexes for performance
IncidentSchema.index({ userId: 1, createdAt: -1 })
IncidentSchema.index({ monitorId: 1, status: 1 })
IncidentSchema.index({ userId: 1, status: 1 })

export const Incident = models.Incident || model<IncidentDocument>('Incident', IncidentSchema)

export default Incident
