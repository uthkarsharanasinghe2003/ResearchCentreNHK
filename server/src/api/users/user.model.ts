import { Schema, model, connect, Types, Document } from 'mongoose';

export interface IUserDTO {
    name: string;
    email: string;
    userType: UserType;
    password?: string;
    uid?: string;
    appId: AppId[]
}

export interface IUserFilterParams {
    keyWord?: string,
    uid?: string,
    appId?: string,
    nids?: string[];
}

export interface IUser extends Document {
    name: string;
    email: string;
    userType: UserType;
    uid: string;
    password?: string;
    appId: AppId[]
}

export enum UserType {
    ADMIN = 'admin',
    USER = 'user'
}

export enum AppId {
    BIOM = 'biom',
    TRE = 'tre'
}

const userchema = new Schema<IUser>({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    userType: { type: String, enum: UserType, default: UserType.USER },
    appId: [{ type: String, enum: AppId, default: AppId.BIOM }],
    uid: { type: String },
}, {
    timestamps: true
});

const User = model<IUser>('user', userchema, 'user');

export default User