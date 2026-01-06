import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
@Unique(['roleId', 'permissionId'])
export class RolePermission {
    @PrimaryColumn()
    id!: string;

    @Column()
    roleId!: string;

    @Column()
    permissionId!: string;

    @ManyToOne(() => Role, (role) => role.permissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'roleId' })
    role!: Role;

    @ManyToOne(() => Permission, (permission) => permission.roles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'permissionId' })
    permission!: Permission;

    @CreateDateColumn()
    createdAt!: Date;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = uuidv4();
        }
    }
}
