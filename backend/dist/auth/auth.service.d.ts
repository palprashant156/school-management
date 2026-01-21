import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '../roles/roles.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private rolesService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, rolesService: RolesService);
    validateUser(username: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            username: any;
            role: any;
            email: any;
        };
    }>;
    register(createUserDto: any): Promise<import("../users/user.entity").User>;
    logout(userId: string): Promise<import("typeorm").UpdateResult>;
    refresh(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            role: any;
            email: any;
        };
    }>;
}
