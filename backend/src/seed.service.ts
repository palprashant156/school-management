import { Injectable, OnModuleInit } from '@nestjs/common';
import { RolesService } from './roles/roles.service';
import { PermissionsService } from './permissions/permissions.service';
import { Permission } from './permissions/permission.entity';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        private readonly rolesService: RolesService,
        private readonly permissionsService: PermissionsService,
    ) { }

    async onModuleInit() {
        await this.seedPermissionsAndRoles();
    }

    async seedPermissionsAndRoles() {
        console.log('Seeding Permissions and Roles...');

        // Define default permissions
        const permissions = [
            'create_user', 'read_user', 'update_user', 'delete_user',
            'create_role', 'read_role', 'update_role', 'delete_role',
        ];

        const savedPermissions: Permission[] = [];

        for (const perm of permissions) {
            let existing = (await this.permissionsService.findAll()).find(p => p.name === perm);
            if (!existing) {
                existing = await this.permissionsService.create(perm, `Permission to ${perm.replace('_', ' ')}`);
                console.log(`Created permission: ${perm}`);
            }
            savedPermissions.push(existing);
        }

        // Define default roles
        const roles = ['admin', 'user', 'teacher', 'student'];

        for (const roleName of roles) {
            const existing = await this.rolesService.findByName(roleName);
            if (!existing) {
                let rolePermissions: string[] = [];
                if (roleName === 'admin') {
                    rolePermissions = savedPermissions.map(p => p.id);
                } else if (roleName === 'teacher') {
                    // Teacher gets read permissions + update user
                    rolePermissions = savedPermissions.filter(p => p.name.startsWith('read') || p.name === 'update_user').map(p => p.id);
                } else {
                    // User and Student get only read permissions
                    rolePermissions = savedPermissions.filter(p => p.name.startsWith('read')).map(p => p.id);
                }

                await this.rolesService.create(roleName, rolePermissions);
                console.log(`Created role: ${roleName}`);
            }
        }
    }
}
