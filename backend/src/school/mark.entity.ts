import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
// Mark Entity
import { Student } from './student.entity';

@Entity({ name: 'marks' })
export class Mark { 
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    subject: string;

    @Column('int')
    marks: number;

    @ManyToOne(() => Student)
    @JoinColumn({ name: 'student_id' })
    student: Student;
}
 