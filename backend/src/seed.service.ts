import { Injectable, OnModuleInit } from '@nestjs/common';
import { RolesService } from './roles/roles.service';
import { PermissionsService } from './permissions/permissions.service';
import { Permission } from './permissions/permission.entity';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        private readonly rolesService: RolesService,
        private readonly permissionsService: PermissionsService,
        private readonly usersService: UsersService,
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

        // Seed Admin User
        const adminEmail = 'admin@example.com';
        const adminUser = await this.usersService.findOne(adminEmail);
        if (!adminUser) {
            console.log('Creating default admin user...');
            const adminRole = await this.rolesService.findByName('admin');
            if (adminRole) {
                const hashedPassword = await bcrypt.hash('password123', 10);
                await this.usersService.create({
                    username: 'admin', // Keeping typical username
                    email: adminEmail,
                    password: hashedPassword,
                    firstName: 'Admin',
                    lastName: 'User',
                    role: adminRole,
                });
                console.log('Created default admin user: admin@example.com / password123');
            }
        } else {
            // Check if role is correct, if not update it
            if (adminUser.role?.name !== 'admin') {
                console.log('Fixing admin user role...');
                const adminRole = await this.rolesService.findByName('admin');
                if (adminRole) {
                    await this.usersService.assignRole(adminUser.id, adminRole);
                    console.log('Updated admin user role to admin');
                }
            }
        }
    }
}
