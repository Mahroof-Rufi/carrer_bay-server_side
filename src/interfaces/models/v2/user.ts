export interface User {
    id: number,
    fullName: string,
    userName: string,
    email: string,
    password: string;
    userType: 'EMPLOYER' | 'CANDIDATE',
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
}

export interface CreateUserInput {
    fullName: string,
    userName: string,
    email: string,
    password: string,
    userType: 'EMPLOYER' | 'CANDIDATE',
}

export type UserForVerification = Omit<User, "password" | "createdAt" | "updatedAt" | "userType"> & {
    security_code: string | null;
    role: string;
};