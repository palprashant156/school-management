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
exports.SchoolService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_entity_1 = require("./class.entity");
const student_entity_1 = require("./student.entity");
const teacher_entity_1 = require("./teacher.entity");
const attendance_entity_1 = require("./attendance.entity");
const mark_entity_1 = require("./mark.entity");
let SchoolService = class SchoolService {
    classRepository;
    studentRepository;
    teacherRepository;
    attendanceRepository;
    markRepository;
    constructor(classRepository, studentRepository, teacherRepository, attendanceRepository, markRepository) {
        this.classRepository = classRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.attendanceRepository = attendanceRepository;
        this.markRepository = markRepository;
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
    createTeacher(data) {
        return this.teacherRepository.save(data);
    }
    findAllAttendance() {
        return this.attendanceRepository.find({ relations: ['student'] });
    }
    createAttendance(data) {
        return this.attendanceRepository.save(data);
    }
    findAllMarks() {
        return this.markRepository.find({ relations: ['student'] });
    }
    createMark(data) {
        return this.markRepository.save(data);
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
        typeorm_2.Repository])
], SchoolService);
//# sourceMappingURL=school.service.js.map