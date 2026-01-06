import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsNumber()
  authorId!: number;
}