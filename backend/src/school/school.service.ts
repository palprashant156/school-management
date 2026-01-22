import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
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
}
