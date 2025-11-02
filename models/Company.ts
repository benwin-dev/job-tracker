import mongoose, { Schema, Document, Types } from 'mongoose';
import { IJobApplication } from './JobApplication';

export interface ICompany extends Document {
  name: string;
  applications: Types.ObjectId[];
  createdAt: Date;
}

const CompanySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  applications: [{
    type: Schema.Types.ObjectId,
    ref: 'JobApplication',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);

