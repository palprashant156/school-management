import { Repository } from 'typeorm';
import { Class } from './class.entity';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { Attendance } from './attendance.entity';
import { Mark } from './mark.entity';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { CreateStudentDto } from './dto/create-student.dto';
export declare class SchoolService {
    private classRepository;
    private studentRepository;
    private teacherRepository;
    private attendanceRepository;
    private markRepository;
    private readonly usersService;
    private readonly rolesService;
    constructor(classRepository: Repository<Class>, studentRepository: Repository<Student>, teacherRepository: Repository<Teacher>, attendanceRepository: Repository<Attendance>, markRepository: Repository<Mark>, usersService: UsersService, rolesService: RolesService);
    findAllClasses(): Promise<Class[]>;
    createClass(data: Partial<Class>): Promise<Partial<Class> & Class>;
    findAllStudents(): Promise<Student[]>;
    createStudent(createStudentDto: CreateStudentDto): Promise<Student>;
    findAllTeachers(): Promise<Teacher[]>;
    createTeacher(data: any): Promise<Teacher>;
    findAllAttendance(): Promise<Attendance[]>;
    createAttendance(data: (Partial<Attendance> & {
        student_id: string;
    })[]): Promise<Attendance[]>;
    findAllMarks(): Promise<Mark[]>;
    createMark(data: (Partial<Mark> & {
        student_id: string;
    })[]): Promise<Mark[]>;
    removeMark(id: number): Promise<Mark>;
    removeClass(id: number): Promise<Class>;
    removeStudent(id: number): Promise<Student>;
    removeTeacher(id: number): Promise<Teacher>;
}
