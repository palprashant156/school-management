import { Repository } from 'typeorm';
import { Class } from './class.entity';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { Attendance } from './attendance.entity';
import { Mark } from './mark.entity';
export declare class SchoolService {
    private classRepository;
    private studentRepository;
    private teacherRepository;
    private attendanceRepository;
    private markRepository;
    constructor(classRepository: Repository<Class>, studentRepository: Repository<Student>, teacherRepository: Repository<Teacher>, attendanceRepository: Repository<Attendance>, markRepository: Repository<Mark>);
    findAllClasses(): Promise<Class[]>;
    createClass(data: Partial<Class>): Promise<Partial<Class> & Class>;
    findAllStudents(): Promise<Student[]>;
    createStudent(data: Partial<Student>): Promise<Partial<Student> & Student>;
    findAllTeachers(): Promise<Teacher[]>;
    createTeacher(data: Partial<Teacher>): Promise<Partial<Teacher> & Teacher>;
    findAllAttendance(): Promise<Attendance[]>;
    createAttendance(data: Partial<Attendance>): Promise<Partial<Attendance> & Attendance>;
    findAllMarks(): Promise<Mark[]>;
    createMark(data: Partial<Mark>): Promise<Partial<Mark> & Mark>;
}
