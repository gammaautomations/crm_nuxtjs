import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export const TEMPLATE_TYPES = [
  'contrato',
  'escrito_judicial',
  'carta_cliente',
  'otro',
] as const

export type TemplateType = (typeof TEMPLATE_TYPES)[number]

export interface ITemplate extends Document {
  name:        string
  description: string
  type:        TemplateType
  content:     string
  variables:   string[]
  active:      boolean
  createdBy:   Types.ObjectId
  updatedBy?:  Types.ObjectId
}

export interface ITemplateModel extends Model<ITemplate> {}

const TemplateSchema = new Schema<ITemplate, ITemplateModel>(
  {
    name:        { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true },
    type:        { type: String, enum: TEMPLATE_TYPES, default: 'contrato' },
    content:     { type: String, required: true },
    variables:   { type: [String], default: [] },
    active:      { type: Boolean, default: true },
    createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

TemplateSchema.index({ type: 1, active: 1 })
TemplateSchema.index({ createdAt: -1 })

TemplateSchema.pre('save', function () {
  const matches = this.content.match(/\{\{([^}]+)\}\}/g) || []
  this.variables = [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()))]
})

const DocumentTemplate: ITemplateModel =
  (mongoose.models.DocumentTemplate as ITemplateModel) ||
  mongoose.model<ITemplate, ITemplateModel>('DocumentTemplate', TemplateSchema)

export default DocumentTemplate
