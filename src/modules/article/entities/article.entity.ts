import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum ArticleStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PUBLISHED = 'PUBLISHED',
}

@Entity('articles')
export class Article {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column()
    title!: string;

    @Column({ unique: true })
    slug!: string;

    @Column('text')
    content!: string;

    @Column({
        type: 'enum',
        enum: ArticleStatus,
        default: ArticleStatus.DRAFT,
    })
    status!: ArticleStatus;

    @Column()
    authorId!: number;

    @Column({ nullable: true })
    editorId?: number;

    @Column({ nullable: true })
    approverId?: number;

    @Column({ type: 'timestamp', nullable: true })
    publishedAt?: Date;

    @Column({ default: 1 })
    version!: number;

    @ManyToOne(() => User, (user) => user.authoredArticles)
    @JoinColumn({ name: 'authorId' })
    author!: User;

    @ManyToOne(() => User, (user) => user.editedArticles, { nullable: true })
    @JoinColumn({ name: 'editorId' })
    editor?: User;

    @ManyToOne(() => User, (user) => user.approvedArticles, { nullable: true })
    @JoinColumn({ name: 'approverId' })
    approver?: User;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
