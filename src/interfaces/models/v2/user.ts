export interface User {
    id: number,
    fullName: string,
    userName: string,
    email: string,
    password: string;
    userType: 'EMPLOYER' | 'CANDIDATE',
    is_active: boolean,
    created_at: Date,
    updated_at: Date,
}