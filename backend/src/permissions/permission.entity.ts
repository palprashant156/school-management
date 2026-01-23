import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// This entity represents a specific action that can be performed in the system.
// For example: 'create_user', 'delete_user', 'view_dashboard'
@Entity()
export class Permission {
  // Unique ID for each permission
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The name of the permission, e.g., 'create_user'
  @Column({ unique: true })
  name: string;

  // A short description to explain what this permission does
  @Column({ nullable: true })
  description: string;
}