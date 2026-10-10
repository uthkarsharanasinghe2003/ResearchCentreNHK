import { UserType } from '../api/users/user.model';
import * as app from 'firebase-admin'
import sharp from 'sharp';

export const createUser = async (email: string, password: string, name: string, userType: UserType = UserType.USER) => {
    const user = await app.auth().createUser({
        email: email,
        emailVerified: true,
        password: password,
        displayName: name,
        disabled: false,
    });

    if(user) {
        const claims = userType === UserType.ADMIN ? { admin: true } :  { user: true }
        await app.auth().setCustomUserClaims(user.uid, claims)
    }

    return user?.uid;
}

export const uploadFile = async (fileName: string, base64Data: string, contentType: string = 'image/webp') => {
    const bucket = app.storage().bucket();

    const file = bucket.file(fileName);
    const fileBuffer = await imageToWebp(base64Data);

    if(fileBuffer) {
        await file.save(fileBuffer, {
            metadata: {
              contentType
            }
        });
        return fileName;
    }
    
}

const imageToWebp = async (base64: string) => {
    const imageBuffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const buffer = await sharp(imageBuffer).resize(400).webp({ quality: 80 }).toBuffer();
    return buffer;
}

export const getImageUrl = async (path: string) => {
    const bucket = app.storage().bucket();
    const file = bucket.file(path);
    const signedUrl = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
    });
    return signedUrl[0];
};