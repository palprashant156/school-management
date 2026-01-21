import { UsersService } from './users.service';
import { User } from './user.entity';
import { RolesService } from '../roles/roles.service';
export declare class UsersController {
    private readonly usersService;
    private readonly rolesService;
    constructor(usersService: UsersService, rolesService: RolesService);
    create(createUserDto: any): Promise<User>;
    findAll(): Promise<User[]>;
    getProfile(req: any): Promise<User | null>;
    findOne(id: string): Promise<User | null>;
    update(id: string, updateUserDto: Partial<User>): Promise<User | null>;
    remove(id: string): Promise<void>;
}
