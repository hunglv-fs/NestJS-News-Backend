import { IsNumber } from 'class-validator';

export class SubmitArticleDto {
  @IsNumber()
  editorId!: number;
}