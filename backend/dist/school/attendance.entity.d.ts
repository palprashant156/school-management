import { Student } from './student.entity';
export declare class Attendance {
    id: number;
    attendance_date: Date;
    status: string;
    student: Student;
}
