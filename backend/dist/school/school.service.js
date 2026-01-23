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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_entity_1 = require("./class.entity");
const student_entity_1 = require("./student.entity");
const teacher_entity_1 = require("./teacher.entity");
const attendance_entity_1 = require("./attendance.entity");
const mark_entity_1 = require("./mark.entity");
const users_service_1 = require("../users/users.service");
const roles_service_1 = require("../roles/roles.service");
const bcrypt = __importStar(require("bcrypt"));
let SchoolService = class SchoolService {
    classRepository;
    studentRepository;
    teacherRepository;
    attendanceRepository;
    markRepository;
    usersService;
    rolesService;
    constructor(classRepository, studentRepository, teacherRepository, attendanceRepository, markRepository, usersService, rolesService) {
        this.classRepository = classRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.attendanceRepository = attendanceRepository;
        this.markRepository = markRepository;
        this.usersService = usersService;
        this.rolesService = rolesService;
    }
    findAllClasses() {
        return this.classRepository.find();
    }
    async createClass(data) {
        try {
            return await this.classRepository.save(data);
        }
        catch (error) {
            if (error.code === '23505') {
                throw new common_1.ConflictException('Class with this name already exists');
            }
            throw new common_1.InternalServerErrorException();
        }
    }
    findAllStudents() {
        return this.studentRepository.find({ relations: ['class', 'user'] });
    }
    createStudent(data) {
        return this.studentRepository.save(data);
    }
    findAllTeachers() {
        return this.teacherRepository.find({ relations: ['user'] });
    }
    async createTeacher(data) {
        const { username, email, password, subject, firstName, lastName } = data;
        if (!username || !email || !password || !subject || !firstName || !lastName) {
            throw new common_1.ConflictException('Missing required fields: username, email, password, subject, firstName, lastName');
        }
        const teacherRole = await this.rolesService.findByName('teacher');
        if (!teacherRole) {
            throw new common_1.NotFoundException('"teacher" role not found. Please create it first.');
        }
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await this.usersService.create({
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: teacherRole,
            });
            const teacher = new teacher_entity_1.Teacher();
            teacher.subject = subject;
            teacher.user = newUser;
            return await this.teacherRepository.save(teacher);
        }
        catch (error) {
            if (error.code === '23505') {
                throw new common_1.ConflictException('Username or email already exists.');
            }
            throw new common_1.InternalServerErrorException(error);
        }
    }
    findAllAttendance() {
        return this.attendanceRepository.find({ relations: ['student'] });
    }
    async createAttendance(data) {
        try {
            const attendances = data.map(item => {
                const attendance = new attendance_entity_1.Attendance();
                Object.assign(attendance, item);
                const student = new student_entity_1.Student();
                student.id = parseInt(item.student_id, 10);
                attendance.student = student;
                return attendance;
            });
            return await this.attendanceRepository.save(attendances);
        }
        catch (error) {
            if (error.code === '23503') {
                throw new common_1.ConflictException('One of the student IDs does not exist.');
            }
            throw new common_1.InternalServerErrorException(error);
        }
    }
    findAllMarks() {
        return this.markRepository.find({ relations: ['student'] });
    }
    async createMark(data) {
        try {
            const marks = data.map(item => {
                const mark = new mark_entity_1.Mark();
                Object.assign(mark, item);
                const student = new student_entity_1.Student();
                student.id = parseInt(item.student_id, 10);
                mark.student = student;
                return mark;
            });
            return await this.markRepository.save(marks);
        }
        catch (error) {
            if (error.code === '23503') {
                throw new common_1.ConflictException('One of the student IDs does not exist.');
            }
            throw new common_1.InternalServerErrorException(error);
        }
    }
    async removeMark(id) {
        const mark = await this.markRepository.findOne({ where: { id } });
        if (!mark) {
            throw new common_1.NotFoundException(`Mark with ID ${id} not found`);
        }
        return this.markRepository.remove(mark);
    }
};
exports.SchoolService = SchoolService;
exports.SchoolService = SchoolService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(2, (0, typeorm_1.InjectRepository)(teacher_entity_1.Teacher)),
    __param(3, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(4, (0, typeorm_1.InjectRepository)(mark_entity_1.Mark)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        roles_service_1.RolesService])
], SchoolService);
//# sourceMappingURL=school.service.js.map