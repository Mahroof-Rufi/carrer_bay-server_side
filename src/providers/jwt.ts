import { sign, verify, JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path"

dotenv.config();

class Jwt {

    private _secretKey: string;

    constructor() {
        this._secretKey = process.env.JWT_Secret || "";
    }

    createAccessToken(id: string | number, role: string): string | undefined {
        try {

            if (!this._secretKey) {
                throw new Error('Secret key is undefined');
            }

            const payload = { id, role };
            const token = sign(payload, this._secretKey, { expiresIn: '24h' });
            return token;

        } catch (error) {
            console.error(error);
        }
    }

    createRefreshToken(id: string, role: string): string | undefined {
        try {

            if (!this._secretKey) {
                throw new Error('Secret key is undefined');
            }

            const payload = { id, role };
            const token = sign(payload, this._secretKey, { expiresIn: '7d' });
            return token;

        } catch (error) {
            console.error(error);
        }
    }

    verifyToken(token: string, role: 'User' | 'Employer' | 'Admin'): JwtPayload | null {
        try {
            const decodedToken = verify(token, this._secretKey) as JwtPayload;
            return decodedToken
        } catch (error: any) {
            if (error.name == 'TokenExpiredError') {
                switch (role) {
                    case 'User':
                        return {
                            status: 401,
                            message: 'User token expired'
                        }
                    case 'Employer':
                        return {
                            status: 401,
                            message: 'Employer token expired'
                        }
                    case 'Admin':
                        return {
                            status: 401,
                            message: 'Admin token expired'
                        }
                }
            } else {
                console.error(error);
                return {
                    status: 40,
                    message: 'Invalid Token'
                }
            }
        }
    }

    verifyRefreshToken(token: string): JwtPayload | null {
        try {
            const decodedToken = verify(token, this._secretKey) as JwtPayload;
            return decodedToken
        } catch (error: any) {
            if (error.name == 'TokenExpiredError') {
                return {
                    status: 401,
                    message: 'Refresh token expired, login again'
                }
            } else {
                console.error(error);
                return {
                    status: 40,
                    message: 'Invalid Token'
                }
            }
        }
    }

}

export default Jwt