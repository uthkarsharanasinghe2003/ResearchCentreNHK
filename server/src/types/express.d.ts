import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

declare namespace Express {
    export interface Request {
      user: any
    }
}
