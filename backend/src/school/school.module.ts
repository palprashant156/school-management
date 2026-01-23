import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { Class } from './class.entity';
import { Attendance } from './attendance.entity'; 
import { Mark } from './mark.entity';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [TypeOrmModule.forFeature([Student, Teacher, Class, Attendance, Mark]), UsersModule, RolesModule],
    controllers: [SchoolController],
    providers: [SchoolService],
})
export class SchoolModule { }