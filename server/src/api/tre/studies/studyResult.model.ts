import { Schema, SchemaTypes, model } from "mongoose";
import { IUser } from "../../users/user.model";
import { IStudy } from "./study.model";
import { IStudyVariable } from "./studyVariable.model";
import Counter from "./counter.model";

export interface IStudyResult extends Document {
    note: string;
    createdBy: IUser;
    study: string | IStudy;
    results: IResult[];
    status: ResultStatus;
    reference: string;
}

export interface IResult {
    variable: string | IStudyVariable
    value: string | number;
    values: string[] | number[];
    multi: boolean;
}

export enum ResultStatus {
    APPROVED = 'approved',
    PENDING_APPROVAL = 'pending_approval'
}

export interface IStudyResultFilterParams {
    study?: string,
    status?: string,
    keyWord?: string;
    variables?: [ { id: string, value: string, from: any, to: any}];
}

const studyResultSchema = new Schema<IStudyResult>({
    note: { type: String },
    study: { type: SchemaTypes.ObjectId, ref: 'study' },
    results: [{
        variable: { type: SchemaTypes.ObjectId, ref: 'studyVariable'},
        value: { type: String },
        values: [{ type: String }],
        multi: { type: Boolean }
    }],
    status: { type: String, enum: ResultStatus, default: ResultStatus.PENDING_APPROVAL },
    createdBy: { type: SchemaTypes.ObjectId, ref: 'user'},
    reference: { type: String, unique: true },
}, {
    timestamps: true
});

studyResultSchema.pre('save', async function (next) {
    const doc = this;
    if (!doc.reference) {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'results' },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
      const paddedSeq = String(counter.seq).padStart(6, '0'); 
      doc.reference = `RES-${paddedSeq}`;
    }
  
    next();
});

const StudyResult = model<IStudyResult>('studyResult', studyResultSchema, 'studyResult');

export default StudyResult