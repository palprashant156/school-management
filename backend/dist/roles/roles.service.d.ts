import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from '../permissions/permission.entity';
export declare class RolesService {
    private rolesRepository;
    private permissionsRepository;
    constructor(rolesRepository: Repository<Role>, permissionsRepository: Repository<Permission>);
    create(name: string, permissionIds?: string[]): Promise<Role>;
    findAll(): Promise<Role[]>;
    findOne(id: string): Promise<Role | null>;
    findByName(name: string): Promise<Role | null>;
    update(id: string, name: string, permissionIds: string[]): Promise<Role | null>;
    remove(id: string): Promise<void>;
}
