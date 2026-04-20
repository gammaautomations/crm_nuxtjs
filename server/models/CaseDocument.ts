import type { Document, Model, Types } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export interface IDocument extends Document {
  name: string
  originalName: string
  mimeType: string
  size: number // bytes
  driveId: string // Google Drive file ID
  driveUrl: string // webViewLink
  downloadUrl: string // webContentLink

  // Relaciones
  caseId: Types.ObjectId
  uploadedBy: Types.ObjectId
}

export interface IDocumentModel extends Model<IDocument> {}

const DocumentSchema = new Schema<IDocument, IDocumentModel>(
  {
    name: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    driveId: { type: String, required: true },
    driveUrl: { type: String, required: true },
    downloadUrl: { type: String, required: true },

    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
)

DocumentSchema.index({ caseId: 1, createdAt: -1 })

const CaseDocument: IDocumentModel
  = (mongoose.models.CaseDocument as IDocumentModel)
  || mongoose.model<IDocument, IDocumentModel>('CaseDocument', DocumentSchema)

export default CaseDocument
