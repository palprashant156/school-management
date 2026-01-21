import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SchoolService } from './school.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('school')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolController {
    constructor(private readonly schoolService: SchoolService) { }

    @Get('classes')
    @Roles('admin', 'teacher', 'student') // Visible to all
    getAllClasses() {
        return this.schoolService.findAllClasses();
    }

    @Post('classes')
    @Roles('admin', 'teacher') // Only Admin/Teacher can create
    createClass(@Body() body: any) {
        return this.schoolService.createClass(body);
    }

    @Get('students')
    @Roles('admin', 'teacher') // Only Admin/Teacher can see all students
    getAllStudents() {
        return this.schoolService.findAllStudents();
    }

    @Post('students')
    @Roles('admin', 'teacher') // Only Admin/Teacher can create students
    createStudent(@Body() body: any) {
        return this.schoolService.createStudent(body);
    }

    @Get('teachers')
    @Roles('admin', 'teacher') // Only Admin/Teacher can see all teachers
    getAllTeachers() {
        return this.schoolService.findAllTeachers();
    }

    @Post('teachers')
    @Roles('admin') // Only Admin can create teachers
    createTeacher(@Body() body: any) {
        return this.schoolService.createTeacher(body);
    }

    @Get('attendance')
    @Roles('admin', 'teacher', 'student') // Visible to all
    getAllAttendance() {
        return this.schoolService.findAllAttendance();
    }

    @Post('attendance')
    @Roles('admin', 'teacher') // Only Admin/Teacher can mark attendance
    createAttendance(@Body() body: any) {
        return this.schoolService.createAttendance(body);
    }

    @Get('marks')
    @Roles('admin', 'teacher', 'student') // Visible to all
    getAllMarks() {
        return this.schoolService.findAllMarks();
    }

    @Post('marks')
    @Roles('admin', 'teacher') // Only Admin/Teacher can assign marks
    createMark(@Body() body: any) {
        return this.schoolService.createMark(body);
    }
}
