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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolController = void 0;
const common_1 = require("@nestjs/common");
const school_service_1 = require("./school.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let SchoolController = class SchoolController {
    schoolService;
    constructor(schoolService) {
        this.schoolService = schoolService;
    }
    getAllClasses() {
        return this.schoolService.findAllClasses();
    }
    createClass(body) {
        return this.schoolService.createClass(body);
    }
    getAllStudents() {
        return this.schoolService.findAllStudents();
    }
    createStudent(body) {
        return this.schoolService.createStudent(body);
    }
    getAllTeachers() {
        return this.schoolService.findAllTeachers();
    }
    createTeacher(body) {
        return this.schoolService.createTeacher(body);
    }
    getAllAttendance() {
        return this.schoolService.findAllAttendance();
    }
    createAttendance(body) {
        if (Array.isArray(body)) {
            return this.schoolService.createAttendance(body);
        }
        return this.schoolService.createAttendance([body]);
    }
    getAllMarks() {
        return this.schoolService.findAllMarks();
    }
    createMark(body) {
        if (Array.isArray(body)) {
            return this.schoolService.createMark(body);
        }
        return this.schoolService.createMark([body]);
    }
};
exports.SchoolController = SchoolController;
__decorate([
    (0, common_1.Get)('classes'),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchoolController.prototype, "getAllClasses", null);
__decorate([
    (0, common_1.Post)('classes'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SchoolController.prototype, "createClass", null);
__decorate([
    (0, common_1.Get)('students'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchoolController.prototype, "getAllStudents", null);
__decorate([
    (0, common_1.Post)('students'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SchoolController.prototype, "createStudent", null);
__decorate([
    (0, common_1.Get)('teachers'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchoolController.prototype, "getAllTeachers", null);
__decorate([
    (0, common_1.Post)('teachers'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SchoolController.prototype, "createTeacher", null);
__decorate([
    (0, common_1.Get)('attendance'),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchoolController.prototype, "getAllAttendance", null);
__decorate([
    (0, common_1.Post)('attendance'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], SchoolController.prototype, "createAttendance", null);
__decorate([
    (0, common_1.Get)('marks'),
    (0, roles_decorator_1.Roles)('admin', 'teacher', 'student'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchoolController.prototype, "getAllMarks", null);
__decorate([
    (0, common_1.Post)('marks'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], SchoolController.prototype, "createMark", null);
exports.SchoolController = SchoolController = __decorate([
    (0, common_1.Controller)('school'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [school_service_1.SchoolService])
], SchoolController);
//# sourceMappingURL=school.controller.js.map