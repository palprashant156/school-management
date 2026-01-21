import { Role } from '../roles/role.entity';
export declare class User {
    id: string;
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    currentHashedRefreshToken: string | null;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
