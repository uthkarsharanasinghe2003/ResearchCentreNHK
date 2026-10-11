import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { UserType } from '../api/users/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const createUser = async (email: string, password: string, name: string, userType: UserType = UserType.USER): Promise<string> => {
    // Return a generated uid (mongo will store the actual _id, but we return a placeholder)
    // The uid field will be set to the mongo _id after saving — handled in user.service.ts
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const generateToken = (payload: object): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, JWT_SECRET);
};

export const uploadFile = async (fileName: string, base64Data: string, contentType: string = 'image/webp'): Promise<string> => {
    const safeFileName = fileName.replace(/\//g, '_') + '.webp';
    const filePath = path.join(UPLOADS_DIR, safeFileName);

    const imageBuffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const buffer = await sharp(imageBuffer).resize(400).webp({ quality: 80 }).toBuffer();

    fs.writeFileSync(filePath, buffer);
    return safeFileName;
};

export const getImageUrl = async (fileName: string): Promise<string> => {
    // Return a local server URL to serve the file
    const baseUrl = process.env.SERVER_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${fileName}`;
};