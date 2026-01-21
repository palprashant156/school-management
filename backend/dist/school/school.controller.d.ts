import { SchoolService } from './school.service';
export declare class SchoolController {
    private readonly schoolService;
    constructor(schoolService: SchoolService);
    getAllClasses(): Promise<import("./class.entity").Class[]>;
    createClass(body: any): Promise<Partial<import("./class.entity").Class> & import("./class.entity").Class>;
    getAllStudents(): Promise<import("./student.entity").Student[]>;
    createStudent(body: any): Promise<Partial<import("./student.entity").Student> & import("./student.entity").Student>;
    getAllTeachers(): Promise<import("./teacher.entity").Teacher[]>;
    createTeacher(body: any): Promise<Partial<import("./teacher.entity").Teacher> & import("./teacher.entity").Teacher>;
    getAllAttendance(): Promise<import("./attendance.entity").Attendance[]>;
    createAttendance(body: any): Promise<Partial<import("./attendance.entity").Attendance> & import("./attendance.entity").Attendance>;
    getAllMarks(): Promise<import("./mark.entity").Mark[]>;
    createMark(body: any): Promise<Partial<import("./mark.entity").Mark> & import("./mark.entity").Mark>;
}
