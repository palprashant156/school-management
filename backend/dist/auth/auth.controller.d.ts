import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
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
    logout(req: any): Promise<import("typeorm").UpdateResult>;
    refresh(req: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            role: any;
            email: any;
        };
    }>;
    getProfile(req: any): any;
}
