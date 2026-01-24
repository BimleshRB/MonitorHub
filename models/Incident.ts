import { Schema, model, models, Document, Types } from 'mongoose'

export interface IncidentDocument extends Document {
  monitorId: Types.ObjectId
  startedAt: Date
  resolvedAt?: Date
  durationSeconds?: number
  aiExplanation?: string | null
}

const IncidentSchema = new Schema<IncidentDocument>(
  {
    monitorId: { type: Schema.Types.ObjectId, ref: 'Monitor', required: true },
    startedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    durationSeconds: { type: Number },
    aiExplanation: { type: String },
  },
  { versionKey: false }
)

export const Incident = models.Incident || model<IncidentDocument>('Incident', IncidentSchema)

export default Incident
