import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Article } from '../../article/entities/article.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ nullable: true })
  parentId?: string;

  @Column({ nullable: true })
  image?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Category, category => category.children)
  parent?: Category;

  @OneToMany(() => Category, category => category.parent)
  children!: Category[];

  @OneToMany(() => Article, article => article.category)
  articles!: Article[];
}
