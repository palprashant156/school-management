import { OnModuleInit } from '@nestjs/common';
import { RolesService } from './roles/roles.service';
import { PermissionsService } from './permissions/permissions.service';
export declare class SeedService implements OnModuleInit {
    private readonly rolesService;
    private readonly permissionsService;
    constructor(rolesService: RolesService, permissionsService: PermissionsService);
    onModuleInit(): Promise<void>;
    seedPermissionsAndRoles(): Promise<void>;
}
