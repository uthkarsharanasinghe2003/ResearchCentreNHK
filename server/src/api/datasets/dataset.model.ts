import { Schema, SchemaTypes, model, Document } from 'mongoose';

export interface IDatasetSummary {
  column: string;
  mean: number;
  min: number;
  max: number;
  count: number;
  stdDev: number;
}

export interface IDataset extends Document {
  name: string;
  description?: string;
  uploadedAt: Date;
  columns: string[];
  rawData: any[];
  summary: IDatasetSummary[];
}

const summarySchema = new Schema<IDatasetSummary>(
  {
    column: { type: String, required: true },
    mean: { type: Number, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    count: { type: Number, required: true },
    stdDev: { type: Number, required: true },
  },
  { _id: false }
);

const datasetSchema = new Schema<IDataset>(
  {
    name: { type: String, required: true },
    description: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    columns: [{ type: String }],
    rawData: [{ type: SchemaTypes.Mixed }],
    summary: [summarySchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Dataset = model<IDataset>('dataset', datasetSchema, 'dataset');

export default Dataset;
