import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './class.entity';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { Attendance } from './attendance.entity';
import { Mark } from './mark.entity';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';

import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class SchoolService {
    constructor(
        @InjectRepository(Class)
        private classRepository: Repository<Class>,
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
        @InjectRepository(Teacher)
        private teacherRepository: Repository<Teacher>,
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>,
        @InjectRepository(Mark)
        private markRepository: Repository<Mark>,
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
    ) { }

    // Classes
    findAllClasses() {
        return this.classRepository.find({ relations: ['students'] });
    }

    async createClass(data: Partial<Class>) {
        try {
            return await this.classRepository.save(data);
        } catch (error) {
            if (error.code === '23505') { // Postgres unique_violation code
                throw new ConflictException('Class with this name already exists');
            }
            throw new InternalServerErrorException();
        }
    }

    // Students
    findAllStudents() {
        return this.studentRepository.find({ relations: ['class', 'user'] });
    }

    async createStudent(createStudentDto: CreateStudentDto) {
        const { username, email, firstName, lastName, roll_no, classId } = createStudentDto;

        const studentRole = await this.rolesService.findByName('student');
        if (!studentRole) {
            throw new NotFoundException('"student" role not found. Please create it first.');
        }

        const studentClass = await this.classRepository.findOne({ where: { id: parseInt(classId, 10) } });
        if (!studentClass) {
            throw new NotFoundException(`Class with ID ${classId} not found.`);
        }

        try {
            // 1. Create the User
            const randomPassword = Math.random().toString(36).slice(-8); // Generate a random password
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            const newUser = await this.usersService.create({
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: studentRole,
            });

            // 2. Create the Student
            const student = new Student();
            student.roll_no = roll_no;
            student.user = newUser;
            student.class = studentClass;

            return await this.studentRepository.save(student);
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Username or email already exists.');
            }
            throw new InternalServerErrorException(error);
        }
    }

    // Teachers
    findAllTeachers() {
        return this.teacherRepository.find({ relations: ['user'] });
    }


    async createTeacher(data: any) {
        const { username, email, password, subject, firstName, lastName } = data;

        if (!username || !email || !password || !subject || !firstName || !lastName) {
            throw new ConflictException('Missing required fields: username, email, password, subject, firstName, lastName');
        }

        const teacherRole = await this.rolesService.findByName('teacher');
        if (!teacherRole) {
            throw new NotFoundException('"teacher" role not found. Please create it first.');
        }

        try {
            // 1. Create the User
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await this.usersService.create({
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: teacherRole,
            });

            // 2. Create the Teacher
            const teacher = new Teacher();
            teacher.subject = subject;
            teacher.user = newUser;

            return await this.teacherRepository.save(teacher);
        } catch (error) {
            // Catch potential duplicate user/email errors from usersService
            if (error.code === '23505') { // Postgres unique_violation
                throw new ConflictException('Username or email already exists.');
            }
            throw new InternalServerErrorException(error);
        }
    }

    // Attendance
    findAllAttendance() {
        return this.attendanceRepository.find({ relations: ['student'] });
    }

    async createAttendance(data: (Partial<Attendance> & { student_id: string })[]) {
        try {
            const attendances = data.map(item => {
                const attendance = new Attendance();
                Object.assign(attendance, item);
                const student = new Student();
                student.id = parseInt(item.student_id, 10);
                attendance.student = student;
                return attendance;
            });
            return await this.attendanceRepository.save(attendances);
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new ConflictException('One of the student IDs does not exist.');
            }
            throw new InternalServerErrorException(error);
        }
    }

    // Marks
    findAllMarks() {
        return this.markRepository.find({ relations: ['student'] });
    }

    async createMark(data: (Partial<Mark> & { student_id: string })[]) {
        try {
            const marks = data.map(item => {
                const mark = new Mark();
                Object.assign(mark, item);
                const student = new Student();
                student.id = parseInt(item.student_id, 10);
                mark.student = student;
                return mark;
            });
            return await this.markRepository.save(marks);
        } catch (error) {
            if (error.code === '23503') { // Foreign key violation
                throw new ConflictException('One of the student IDs does not exist.');
            }
            throw new InternalServerErrorException(error);
        }
    }

    async removeMark(id: number) {
        const mark = await this.markRepository.findOne({ where: { id } });
        if (!mark) {
            throw new NotFoundException(`Mark with ID ${id} not found`);
        }
        return this.markRepository.remove(mark);
    }

    async removeClass(id: number) {
        const classEntity = await this.classRepository.findOne({ where: { id } });
        if (!classEntity) {
            throw new NotFoundException(`Class with ID ${id} not found`);
        }
        return this.classRepository.remove(classEntity);
    }

    async removeStudent(id: number) {
        const student = await this.studentRepository.findOne({ where: { id } });
        if (!student) {
            throw new NotFoundException(`Student with ID ${id} not found`);
        }
        return this.studentRepository.remove(student);
    }

    async removeTeacher(id: number) {
        const teacher = await this.teacherRepository.findOne({ where: { id } });
        if (!teacher) {
            throw new NotFoundException(`Teacher with ID ${id} not found`);
        }
        return this.teacherRepository.remove(teacher);
    }
}
