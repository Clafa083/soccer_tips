export interface User {
    id: number;
    email: string;
    name: string;
    password: string;
    imageUrl?: string;
    isAdmin: boolean;
    createdAt: Date;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface RegisterDTO extends LoginDTO {
    name: string;
}

export interface AuthResponse {
    token: string;
    user: UserWithoutPassword;
}

export interface JwtPayload {
    userId: number;
    email: string;
    isAdmin: boolean;
}
