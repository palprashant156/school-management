import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from '../permissions/permission.entity';

// This entity represents a group of permissions.
// For example: 'Admin' (has all permissions), 'User' (has limited permissions)
@Entity()
export class Role {
  // Unique ID for each role
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The name of the role, e.g., 'admin', 'user'
  @Column({ unique: true })
  name: string;

  // A short description of the role
  @Column({ nullable: true })
  description: string;

  // A role can have many permissions.
  // We use @JoinTable here because this is the "owner" side of the relationship.
  @ManyToMany(() => Permission, { eager: true }) // eager: true means permissions are loaded automatically when we fetch a role
  @JoinTable()
  permissions: Permission[];
}