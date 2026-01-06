import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { SubmitArticleDto } from './dto/submit-article.dto';
import { ApproveArticleDto, ApprovalAction } from './dto/approve-article.dto';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, tap, retryWhen, take, delay, map } from 'rxjs/operators';
import { Article, ArticleStatus } from './entities/article.entity';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) { }

  createDraft(createArticleDto: CreateArticleDto): Observable<any> {
    const slug = createArticleDto.slug || this.generateSlug(createArticleDto.title);

    // TypeORM create doesn't save, just creates instance
    const article = this.articleRepository.create({
      ...createArticleDto,
      slug,
      status: ArticleStatus.DRAFT,
      // Assuming authorId is in createArticleDto
    });

    return from(this.articleRepository.save(article)).pipe(
      switchMap((saved) => this.findOne(saved.id)), // Refetch to get relations
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

        article.status = ArticleStatus.SUBMITTED;
        article.editorId = submitDto.editorId;
        article.version += 1;

        return from(this.articleRepository.save(article)).pipe(
          switchMap(() => this.findOne(id))
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

        article.status = ArticleStatus.UNDER_REVIEW;

        return from(this.articleRepository.save(article)).pipe(
          switchMap(() => this.findOne(id))
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

        article.status = newStatus;
        article.approverId = approverId;
        article.version += 1;

        return from(this.articleRepository.save(article)).pipe(
          switchMap(() => this.findOne(id))
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

        article.status = ArticleStatus.PUBLISHED;
        article.publishedAt = new Date();

        return from(this.articleRepository.save(article)).pipe(
          switchMap(() => this.findOne(id))
        );
      }),
      tap(article => this.logger.log(`Article published: ${article.id}`))
    );
  }

  findAll(): Observable<any[]> {
    return from(
      this.articleRepository.find({
        relations: {
          author: true,
          editor: true,
          approver: true,
        },
        order: {
          updatedAt: 'DESC',
        },
      })
    );
  }

  findOne(id: number): Observable<any> {
    return from(
      this.articleRepository.findOne({
        where: { id },
        relations: {
          author: true,
          editor: true,
          approver: true,
        },
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
    return this.findOne(id).pipe(
      switchMap(article => {
        // Merge updates
        Object.assign(article, updateArticleDto);
        article.version += 1;

        return from(this.articleRepository.save(article)).pipe(
          switchMap(() => this.findOne(id))
        );
      }),
      tap(article => this.logger.log(`Article updated: ${article.id}`))
    );
  }

  remove(id: number): Observable<any> {
    return from(
      this.articleRepository.delete(id)
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