import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../user/entities/user.entity';
import { UserRole } from './user-role.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
    @PrimaryColumn()
    id!: string;

    @Column({ unique: true })
    name!: string;

    @Column({ nullable: true })
    description?: string;

    // Many-to-many relationship through junction table
    @OneToMany(() => UserRole, userRole => userRole.role)
    userRoles!: UserRole[];

    @OneToMany(() => User, user => user.roles)
    users!: User[];

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
    permissions!: RolePermission[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = uuidv4();
        }
    }
}
