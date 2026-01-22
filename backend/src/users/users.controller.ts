import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from './user.entity';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';

import { Role } from '../roles/role.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
    ) { }

    @Roles('admin')
    @Post()
    async create(@Body() createUserDto: any) {
        if (!createUserDto.password) {
            throw new BadRequestException('Password is required');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        let role: Role | null = null;
        if (createUserDto.role) {
            role = await this.rolesService.findByName(createUserDto.role);
        } else {
            role = await this.rolesService.findByName('user');
        }

        return this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
            role: role || undefined,
        });
    }

    @Roles('admin')
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Roles('admin', 'user')
    @Get('profile')
    getProfile(@Request() req) {
        return this.usersService.findOneById(req.user.userId);
    }

    @Roles('admin')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOneById(id);
    }

    @Roles('admin')
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: Partial<User>) {
        return this.usersService.update(id, updateUserDto);
    }

    @Roles('admin')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
