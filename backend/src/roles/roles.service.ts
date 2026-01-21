import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from '../permissions/permission.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionsRepository: Repository<Permission>,
    ) { }

    // Create a new role with optional permissions
    async create(name: string, permissionIds: string[] = []): Promise<Role> {
        const ids = permissionIds || [];
        let permissions: Permission[] = [];
        if (ids.length > 0) {
            permissions = await this.permissionsRepository.findBy({ id: In(ids) });
        }

        const role = this.rolesRepository.create({ name, permissions });
        return this.rolesRepository.save(role);
    }

    // Get all roles
    async findAll(): Promise<Role[]> {
        return this.rolesRepository.find();
    }

    // Get one role by ID
    async findOne(id: string): Promise<Role | null> {
        return this.rolesRepository.findOne({ where: { id } });
    }

    // Get one role by Name
    async findByName(name: string): Promise<Role | null> {
        return this.rolesRepository.findOne({ where: { name } });
    }

    // Update a role
    async update(id: string, name: string, permissionIds: string[]): Promise<Role | null> {
        const role = await this.findOne(id);
        if (!role) {
            throw new Error('Role not found');
        }

        // Update name if provided
        if (name) {
            role.name = name;
        }

        // Update permissions if provided
        if (permissionIds) {
            const permissions = await this.permissionsRepository.findBy({ id: In(permissionIds) });
            role.permissions = permissions;
        }

        return this.rolesRepository.save(role);
    }

    // Delete a role
    async remove(id: string): Promise<void> {
        await this.rolesRepository.delete(id);
    }
}
