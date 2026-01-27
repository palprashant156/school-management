import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Student } from './student.entity';

@Entity({ name: 'classes' })
export class Class {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    class_name: string;

    @Column()
    section: string;

    @OneToMany(() => Student, (student) => student.class)
    students: Student[];
}
