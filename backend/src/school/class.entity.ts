import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'classes' })
export class Class {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    class_name: string;

    @Column()
    section: string;
}
