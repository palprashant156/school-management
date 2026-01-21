import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './class.entity';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { Attendance } from './attendance.entity';
import { Mark } from './mark.entity';

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
    ) { }

    // Classes
    findAllClasses() {
        return this.classRepository.find();
    }

    createClass(data: Partial<Class>) {
        return this.classRepository.save(data);
    }

    // Students
    findAllStudents() {
        return this.studentRepository.find({ relations: ['class', 'user'] });
    }

    createStudent(data: Partial<Student>) {
        return this.studentRepository.save(data);
    }

    // Teachers
    findAllTeachers() {
        return this.teacherRepository.find({ relations: ['user'] });
    }

    createTeacher(data: Partial<Teacher>) {
        return this.teacherRepository.save(data);
    }

    // Attendance
    findAllAttendance() {
        return this.attendanceRepository.find({ relations: ['student'] });
    }

    createAttendance(data: Partial<Attendance>) {
        return this.attendanceRepository.save(data);
    }

    // Marks
    findAllMarks() {
        return this.markRepository.find({ relations: ['student'] });
    }

    createMark(data: Partial<Mark>) {
        return this.markRepository.save(data);
    }
}
