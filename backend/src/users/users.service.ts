import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username }, relations: ['role'] });
  }

  // Create a new user (Registration)
  async create(userData: Partial<User>): Promise<User> {
    try {
      const newUser = this.usersRepository.create(userData);
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (error.code === '23505') { // Postgres unique_violation code
        throw new ConflictException('Username or Email already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  // Find user by ID
  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id }, relations: ['role'] });
  }

  // Find all users
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['role'] });
  }

  // Update user
  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, updateData);
    return this.findOneById(id);
  }

  // Delete user
  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // Assign Role to User
  async assignRole(userId: string, role: Role): Promise<User | null> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.role = role;
    return this.usersRepository.save(user);
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.findOneById(userId);

    if (user && user.currentHashedRefreshToken) {
      const isRefreshTokenMatching = await bcrypt.compare(
        refreshToken,
        user.currentHashedRefreshToken,
      );

      if (isRefreshTokenMatching) {
        return user;
      }
    }
    return null;
  }

  async removeRefreshToken(userId: string) {
    return this.usersRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
  }
}
