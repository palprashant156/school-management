import { Permission } from '../permissions/permission.entity';
export declare class Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
}
