import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { SubmitArticleDto } from './dto/submit-article.dto';
import { ApproveArticleDto, ApprovalAction } from './dto/approve-article.dto';
import { Observable, from, throwError, timer } from 'rxjs';
import { switchMap, tap, retryWhen, take, delay } from 'rxjs/operators';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(private prisma: PrismaService) {}

  createDraft(createArticleDto: CreateArticleDto): Observable<any> {
    const slug = createArticleDto.slug || this.generateSlug(createArticleDto.title);
    
    return from(
      this.prisma.article.create({
        data: {
          ...createArticleDto,
          slug,
          status: ArticleStatus.DRAFT,
        },
        include: { author: true },
      })
    ).pipe(
      tap(article => this.logger.log(`Draft created: ${article.id}`)),
      retryWhen(errors => 
        errors.pipe(
          tap(err => this.logger.warn(`Retry creating draft: ${err.message}`)),
          delay(1000),
          take(3)
        )
      )
    );
  }

  submitForReview(id: number, submitDto: SubmitArticleDto): Observable<any> {
    return this.findOne(id).pipe(
      switchMap(article => {
        if (article.status !== ArticleStatus.DRAFT) {
          return throwError(() => new Error('Only draft articles can be submitted'));
        }
        
        return from(
          this.prisma.article.update({
            where: { id },
            data: {
              status: ArticleStatus.SUBMITTED,
              editorId: submitDto.editorId,
              version: { increment: 1 },
            },
            include: { author: true, editor: true },
          })
        );
      }),
      tap(article => this.logger.log(`Article submitted: ${article.id}`)),
      retryWhen(errors => 
        errors.pipe(
          tap(err => this.logger.warn(`Retry submitting: ${err.message}`)),
          delay(1000),
          take(3)
        )
      )
    );
  }

  startReview(id: number): Observable<any> {
    return this.findOne(id).pipe(
      switchMap(article => {
        if (article.status !== ArticleStatus.SUBMITTED) {
          return throwError(() => new Error('Only submitted articles can be reviewed'));
        }
        
        return from(
          this.prisma.article.update({
            where: { id },
            data: { status: ArticleStatus.UNDER_REVIEW },
            include: { author: true, editor: true },
          })
        );
      }),
      tap(article => this.logger.log(`Review started: ${article.id}`))
    );
  }

  approveOrReject(id: number, approveDto: ApproveArticleDto, approverId: number): Observable<any> {
    return this.findOne(id).pipe(
      switchMap(article => {
        if (article.status !== ArticleStatus.UNDER_REVIEW) {
          return throwError(() => new Error('Only articles under review can be approved/rejected'));
        }
        
        const newStatus = approveDto.action === ApprovalAction.APPROVE 
          ? ArticleStatus.APPROVED 
          : ArticleStatus.REJECTED;
        
        return from(
          this.prisma.article.update({
            where: { id },
            data: {
              status: newStatus,
              approverId,
              version: { increment: 1 },
            },
            include: { author: true, editor: true, approver: true },
          })
        );
      }),
      tap(article => this.logger.log(`Article ${approveDto.action.toLowerCase()}: ${article.id}`))
    );
  }

  publish(id: number): Observable<any> {
    return this.findOne(id).pipe(
      switchMap(article => {
        if (article.status !== ArticleStatus.APPROVED) {
          return throwError(() => new Error('Only approved articles can be published'));
        }
        
        return from(
          this.prisma.article.update({
            where: { id },
            data: {
              status: ArticleStatus.PUBLISHED,
              publishedAt: new Date(),
            },
            include: { author: true, editor: true, approver: true },
          })
        );
      }),
      tap(article => this.logger.log(`Article published: ${article.id}`))
    );
  }

  findAll(): Observable<any[]> {
    return from(
      this.prisma.article.findMany({
        include: { author: true, editor: true, approver: true },
        orderBy: { updatedAt: 'desc' },
      })
    );
  }

  findOne(id: number): Observable<any> {
    return from(
      this.prisma.article.findUnique({
        where: { id },
        include: { author: true, editor: true, approver: true },
      })
    ).pipe(
      switchMap(article => {
        if (!article) {
          return throwError(() => new Error('Article not found'));
        }
        return from([article]);
      })
    );
  }

  update(id: number, updateArticleDto: UpdateArticleDto): Observable<any> {
    return from(
      this.prisma.article.update({
        where: { id },
        data: {
          ...updateArticleDto,
          version: { increment: 1 },
        },
        include: { author: true, editor: true, approver: true },
      })
    ).pipe(
      tap(article => this.logger.log(`Article updated: ${article.id}`))
    );
  }

  remove(id: number): Observable<any> {
    return from(
      this.prisma.article.delete({
        where: { id },
      })
    ).pipe(
      tap(() => this.logger.log(`Article deleted: ${id}`))
    );
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
}