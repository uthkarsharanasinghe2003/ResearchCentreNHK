import { ObjectId, Schema, SchemaTypes, Types, model } from "mongoose";
import { IStudy } from "./study.model";

export interface IStudyVariable extends Document {
    _id: string;
    name: string;
    notes: string;
    study: string | IStudy | Types.ObjectId;
    type: VariableType;
    answerOptions: string[];
    status: VariableStatus;
    isSeachable: boolean;
    isRange: boolean;
    isUnique: boolean;
    order: number;
}

export enum VariableStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export enum VariableType {
    NUMBER = 'number',
    TEXT = 'text',
    IMAGE = 'image',
    RADIO = 'radio',
    CHECKBOX = 'checkbox',
    DROPDOWN = 'dropdown'
}

const studyVariableSchema = new Schema<IStudyVariable>({
    name: { type: String, required: true, },
    notes: { type: String, required: false },
    study: { type: SchemaTypes.ObjectId, ref: 'study' },
    type: { type: String, enum: VariableType, default: VariableType.TEXT },
    answerOptions: [{ type: String, required: false }],
    status: { type: String, enum: VariableStatus, default: VariableStatus.ACTIVE },
    isSeachable: { type: Boolean, default: false },
    isRange: { type: Boolean, default: false },
    isUnique: { type: Boolean, default: false },
    order: { type: Number },
}, {
    timestamps: true
});

const StudyVariable = model<IStudyVariable>('studyVariable', studyVariableSchema, 'studyVariable');

export default StudyVariable