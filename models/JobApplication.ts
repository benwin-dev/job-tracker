import mongoose, { Schema, Document } from 'mongoose';

export interface IJobApplication extends Document {
  title: string;
  location: string;
  status: string;
  createdAt: Date;
}

const JobApplicationSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.JobApplication || mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);

