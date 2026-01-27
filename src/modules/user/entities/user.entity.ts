import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Role } from '../../rbac/entities/role.entity';
import { UserRole } from '../../rbac/entities/user-role.entity';
import { Article } from '../../article/entities/article.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column({ nullable: true })
    name?: string;

    @Column()
    password!: string;

    @Column({ type: 'varchar', nullable: true })
    refreshToken?: string | null;

    // Many-to-many relationship through junction table
    @OneToMany(() => UserRole, userRole => userRole.user, { cascade: true })
    userRoles!: UserRole[];

    @OneToMany(() => Role, role => role.users)
    roles!: Role[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Article, (article) => article.author)
    authoredArticles!: Article[];

    @OneToMany(() => Article, (article) => article.editor)
    editedArticles!: Article[];

    @OneToMany(() => Article, (article) => article.approver)
    approvedArticles!: Article[];
}
