import { Schema, SchemaTypes, model } from "mongoose";
import { IUser } from "../../users/user.model";
import { IStudyVariable } from "./studyVariable.model";
import Counter from "./counter.model";

export interface IStudy extends Document {
    name: string;
    reference?: string;
    description: string;
    createdBy: IUser;
    status: StudyStatus;
    category: StudyCategory;
    members: IMember[];
    variables: IStudyVariable[];
}

export enum StudyStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export enum StudyCategory {
    CKDU = 'ckdu',
}

export interface IMember {
    role: MemberRole;
    user: string | IUser;
    email?: string;
    name?: string;
}

export enum MemberRole {
    MAINTAINER = 'maintainer',
    OWNER = 'owner',
    USER = 'user'
}

export interface IStudyFilterParams {
    keyWord?: string,
    status?: string,
    type?: string,
    category?: string
}

const studySchema = new Schema<IStudy>({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    status: { type: String, enum: StudyStatus, default: StudyStatus.ACTIVE },
    category: { type: String, enum: StudyCategory, default: StudyCategory.CKDU },
    createdBy: { type: SchemaTypes.ObjectId, ref: 'user'},
    members: [{
        role: { type: String, enum: MemberRole, default: MemberRole.USER },
        user: { type: SchemaTypes.ObjectId, ref: 'user'},
    }],
    reference: { type: String, unique: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

studySchema.pre('save', async function (next) {
    const doc = this;
    if (!doc.reference) {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'studies' },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
      const paddedSeq = String(counter.seq).padStart(5, '0'); 
      doc.reference = `STD-${paddedSeq}`;
    }
  
    next();
});

studySchema.virtual('variables', {
    foreignField: 'study',
    localField: '_id',
    ref: 'studyVariable'
})

const Study = model<IStudy>('study', studySchema, 'study');

export default Study