"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const roles_service_1 = require("./roles/roles.service");
const permissions_service_1 = require("./permissions/permissions.service");
const users_service_1 = require("./users/users.service");
const bcrypt = __importStar(require("bcrypt"));
let SeedService = class SeedService {
    rolesService;
    permissionsService;
    usersService;
    constructor(rolesService, permissionsService, usersService) {
        this.rolesService = rolesService;
        this.permissionsService = permissionsService;
        this.usersService = usersService;
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
        const adminEmail = 'admin@example.com';
        const adminUser = await this.usersService.findOne(adminEmail);
        if (!adminUser) {
            console.log('Creating default admin user...');
            const adminRole = await this.rolesService.findByName('admin');
            if (adminRole) {
                const hashedPassword = await bcrypt.hash('password123', 10);
                await this.usersService.create({
                    username: 'admin',
                    email: adminEmail,
                    password: hashedPassword,
                    role: adminRole,
                });
                console.log('Created default admin user: admin@example.com / password123');
            }
        }
        else {
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
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [roles_service_1.RolesService,
        permissions_service_1.PermissionsService,
        users_service_1.UsersService])
], SeedService);
//# sourceMappingURL=seed.service.js.map