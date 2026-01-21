import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';

@Entity()
export class Attendance {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    attendance_date: Date;

    @Column()
    status: string;

    @ManyToOne(() => Student)
    @JoinColumn({ name: 'student_id' })
    student: Student;
}
