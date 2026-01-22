import { OnModuleInit } from '@nestjs/common';
import { RolesService } from './roles/roles.service';
import { PermissionsService } from './permissions/permissions.service';
import { UsersService } from './users/users.service';
export declare class SeedService implements OnModuleInit {
    private readonly rolesService;
    private readonly permissionsService;
    private readonly usersService;
    constructor(rolesService: RolesService, permissionsService: PermissionsService, usersService: UsersService);
    onModuleInit(): Promise<void>;
    seedPermissionsAndRoles(): Promise<void>;
}
