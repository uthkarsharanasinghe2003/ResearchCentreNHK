declare namespace Express {
    interface FirebaseUser {
        name: string;
        admin?: boolean;
        agency?: boolean;
        provider?: boolean;
        worker?: boolean;
        iss: string;
        aud: string;
        auth_time: string;
        user_id: string;
        sub: string;
        iat: number;
        exp: number;
        email: string;
        email_verified: boolean;
    }

    interface Request {
        user?: FirebaseUser
    }
}
