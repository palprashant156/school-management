import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
export declare class PermissionsService {
    private permissionsRepository;
    constructor(permissionsRepository: Repository<Permission>);
    create(name: string, description: string): Promise<Permission>;
    findAll(): Promise<Permission[]>;
}
