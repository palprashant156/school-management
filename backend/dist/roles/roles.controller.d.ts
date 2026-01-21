import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(body: {
        name: string;
        permissionIds: string[];
    }): Promise<import("./role.entity").Role>;
    findAll(): Promise<import("./role.entity").Role[]>;
    findOne(id: string): Promise<import("./role.entity").Role | null>;
    update(id: string, body: {
        name: string;
        permissionIds: string[];
    }): Promise<import("./role.entity").Role | null>;
    remove(id: string): Promise<void>;
}
