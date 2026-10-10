import { Schema, model, connect, Types, Document, SchemaTypes } from 'mongoose';
import { IUser } from '../users/user.model';

export interface IBioMarker extends Document {
    name: string;
    shortName: string;
    commonName: string;
    uniProtKB: string;
    pdb: string;
    ncib: string;
    molecularWeight: number;
    molecularLength: number;
    aaSequence: string;
    status: BioMarkerStatus;
    type: string;
    biomType: BioMarkerType;
    uploadedBy: string | IUser;
    imagePath?: string;
    imageUrl?: string;
    image?: string;
}

export enum BioMarkerType {
    EXISTING = 'existing',
    NOVEL = 'novel'
}

export enum BioMarkerStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export interface IBioMarkerFilterParams {
    keyWord?: string,
    status?: string,
    type?: string,
    biomType?: string
}

const bioMarkerSchema = new Schema<IBioMarker>({
    name: { type: String, required: true, unique: true },
    shortName: { type: String, required: true },
    commonName: { type: String, required: true },
    uniProtKB: { type: String, required: true },
    pdb: { type: String, required: true },
    ncib: { type: String, required: true },
    molecularWeight: { type: Number, required: true },
    molecularLength: { type: Number, required: true },
    aaSequence: { type: String, required: true },
    status: { type: String, enum: BioMarkerStatus, default: BioMarkerStatus.PENDING },
    type: { type: String, required: true },
    biomType: { type: String, enum: BioMarkerType, default: BioMarkerType.EXISTING, required: true },
    imagePath: { type: String },
    uploadedBy: { type: SchemaTypes.ObjectId, ref: 'user'}
}, {
    timestamps: true
});

const BioMarker = model<IBioMarker>('bioMarker', bioMarkerSchema, 'bioMarker');

export default BioMarker