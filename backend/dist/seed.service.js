"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const roles_service_1 = require("./roles/roles.service");
const permissions_service_1 = require("./permissions/permissions.service");
let SeedService = class SeedService {
    rolesService;
    permissionsService;
    constructor(rolesService, permissionsService) {
        this.rolesService = rolesService;
        this.permissionsService = permissionsService;
    }
    async onModuleInit() {
        await this.seedPermissionsAndRoles();
    }
    async seedPermissionsAndRoles() {
        console.log('Seeding Permissions and Roles...');
        const permissions = [
            'create_user', 'read_user', 'update_user', 'delete_user',
            'create_role', 'read_role', 'update_role', 'delete_role',
        ];
        const savedPermissions = [];
        for (const perm of permissions) {
            let existing = (await this.permissionsService.findAll()).find(p => p.name === perm);
            if (!existing) {
                existing = await this.permissionsService.create(perm, `Permission to ${perm.replace('_', ' ')}`);
                console.log(`Created permission: ${perm}`);
            }
            savedPermissions.push(existing);
        }
        const roles = ['admin', 'user', 'teacher', 'student'];
        for (const roleName of roles) {
            const existing = await this.rolesService.findByName(roleName);
            if (!existing) {
                let rolePermissions = [];
                if (roleName === 'admin') {
                    rolePermissions = savedPermissions.map(p => p.id);
                }
                else if (roleName === 'teacher') {
                    rolePermissions = savedPermissions.filter(p => p.name.startsWith('read') || p.name === 'update_user').map(p => p.id);
                }
                else {
                    rolePermissions = savedPermissions.filter(p => p.name.startsWith('read')).map(p => p.id);
                }
                await this.rolesService.create(roleName, rolePermissions);
                console.log(`Created role: ${roleName}`);
            }
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [roles_service_1.RolesService,
        permissions_service_1.PermissionsService])
], SeedService);
//# sourceMappingURL=seed.service.js.map