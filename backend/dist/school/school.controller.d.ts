import { SchoolService } from './school.service';
import { CreateStudentDto } from './dto/create-student.dto';
export declare class SchoolController {
    private readonly schoolService;
    constructor(schoolService: SchoolService);
    getAllClasses(): Promise<import("./class.entity").Class[]>;
    createClass(body: any): Promise<Partial<import("./class.entity").Class> & import("./class.entity").Class>;
    getAllStudents(): Promise<import("./student.entity").Student[]>;
    createStudent(createStudentDto: CreateStudentDto): Promise<import("./student.entity").Student>;
    getAllTeachers(): Promise<import("./teacher.entity").Teacher[]>;
    createTeacher(body: any): Promise<import("./teacher.entity").Teacher>;
    getAllAttendance(): Promise<import("./attendance.entity").Attendance[]>;
    createAttendance(body: any[]): Promise<import("./attendance.entity").Attendance[]>;
    getAllMarks(): Promise<import("./mark.entity").Mark[]>;
    createMark(body: any[]): Promise<import("./mark.entity").Mark[]>;
    removeMark(id: string): Promise<import("./mark.entity").Mark>;
}
