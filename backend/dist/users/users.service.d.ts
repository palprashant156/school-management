import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findOne(email: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<User>;
    findOneById(id: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    update(id: string, updateData: Partial<User>): Promise<User | null>;
    remove(id: string): Promise<void>;
    assignRole(userId: string, role: Role): Promise<User | null>;
    setCurrentRefreshToken(refreshToken: string, userId: string): Promise<void>;
    getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<User | null>;
    removeRefreshToken(userId: string): Promise<import("typeorm").UpdateResult>;
}
