"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const student_entity_1 = require("./student.entity");
const teacher_entity_1 = require("./teacher.entity");
const class_entity_1 = require("./class.entity");
const attendance_entity_1 = require("./attendance.entity");
const mark_entity_1 = require("./mark.entity");
const school_service_1 = require("./school.service");
const school_controller_1 = require("./school.controller");
const users_module_1 = require("../users/users.module");
const roles_module_1 = require("../roles/roles.module");
let SchoolModule = class SchoolModule {
};
exports.SchoolModule = SchoolModule;
exports.SchoolModule = SchoolModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([student_entity_1.Student, teacher_entity_1.Teacher, class_entity_1.Class, attendance_entity_1.Attendance, mark_entity_1.Mark]), users_module_1.UsersModule, roles_module_1.RolesModule],
        controllers: [school_controller_1.SchoolController],
        providers: [school_service_1.SchoolService],
    })
], SchoolModule);
//# sourceMappingURL=school.module.js.map