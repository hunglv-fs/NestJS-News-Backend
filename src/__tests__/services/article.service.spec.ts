import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleService } from '../../modules/article/article.service';
import { Article, ArticleStatus } from '../../modules/article/entities/article.entity';
import { CreateArticleDto } from '../../modules/article/dto/create-article.dto';
import { UpdateArticleDto } from '../../modules/article/dto/update-article.dto';
import { SubmitArticleDto } from '../../modules/article/dto/submit-article.dto';
import { ApproveArticleDto, ApprovalAction } from '../../modules/article/dto/approve-article.dto';
import { TestHelpers } from '../utils/test-helpers';
import { throwError, from } from 'rxjs';
import { lastValueFrom } from 'rxjs';

describe('ArticleService', () => {
  let service: ArticleService;
  let repository: Repository<Article>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(Article),
          useValue: TestHelpers.createMockRepository<Article>(),
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    repository = module.get<Repository<Article>>(getRepositoryToken(Article));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDraft', () => {
    it('should create a draft article successfully', async () => {
      const createDto: CreateArticleDto = {
        title: 'Test Article',
        content: 'Test content',
        authorId: 1,
      };

      const mockArticle = TestHelpers.createMockArticle({
        ...createDto,
        status: ArticleStatus.DRAFT,
        slug: 'test-article-1234567890',
      });

      jest.spyOn(repository, 'create').mockReturnValue(mockArticle as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockArticle as any);
      jest.spyOn(service, 'findOne').mockReturnValue(from([mockArticle]));

      const result = await lastValueFrom(service.createDraft(createDto));

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        slug: expect.stringMatching(/^test-article-\d+$/),
        status: ArticleStatus.DRAFT,
      });
      expect(repository.save).toHaveBeenCalledWith(mockArticle as any);
      expect(result).toEqual(mockArticle);
    });

    it('should generate slug from title when not provided', async () => {
      const createDto: CreateArticleDto = {
        title: 'Test Article Title',
        content: 'Test content',
        authorId: 1,
      };

      const mockArticle = TestHelpers.createMockArticle({
        ...createDto,
        status: ArticleStatus.DRAFT,
        slug: 'test-article-title-1234567890',
      });

      jest.spyOn(repository, 'create').mockReturnValue(mockArticle as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockArticle as any);
      jest.spyOn(service, 'findOne').mockReturnValue(from([mockArticle]));

      await lastValueFrom(service.createDraft(createDto));

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        slug: expect.stringMatching(/^test-article-title-\d+$/),
        status: ArticleStatus.DRAFT,
      });
    });

    it('should use provided slug when available', async () => {
      const createDto: CreateArticleDto = {
        title: 'Test Article',
        content: 'Test content',
        slug: 'custom-slug',
        authorId: 1,
      };

      const mockArticle = TestHelpers.createMockArticle({
        ...createDto,
        status: ArticleStatus.DRAFT,
      });

      jest.spyOn(repository, 'create').mockReturnValue(mockArticle as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockArticle as any);
      jest.spyOn(service, 'findOne').mockReturnValue(from([mockArticle]));

      await lastValueFrom(service.createDraft(createDto));

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        slug: 'custom-slug',
        status: ArticleStatus.DRAFT,
      });
    });
  });

  describe('submitForReview', () => {
    it('should submit draft article for review successfully', async () => {
      const articleId = 1;
      const submitDto: SubmitArticleDto = { editorId: 2 };

      const mockArticle = TestHelpers.createMockArticle({
        id: articleId,
        status: ArticleStatus.DRAFT,
        editorId: undefined,
        version: 1,
      });

      const updatedArticle = { ...mockArticle, status: ArticleStatus.SUBMITTED, editorId: 2, version: 2 };
      
      jest.spyOn(service, 'findOne')
        .mockReturnValueOnce(from([mockArticle]))
        .mockReturnValueOnce(from([updatedArticle]));
      jest.spyOn(repository, 'save').mockResolvedValue(updatedArticle as any);

      const result = await lastValueFrom(service.submitForReview(articleId, submitDto));

      expect(result.status).toBe(ArticleStatus.SUBMITTED);
      expect(result.editorId).toBe(2);
      expect(result.version).toBe(2);
    });

    it('should throw error when submitting non-draft article', async () => {
      const articleId = 1;
      const submitDto: SubmitArticleDto = { editorId: 2 };

      const mockArticle = TestHelpers.createMockArticle({
        id: articleId,
        status: ArticleStatus.SUBMITTED,
      });

      jest.spyOn(service, 'findOne').mockReturnValue(from([mockArticle]));

      await expect(lastValueFrom(service.submitForReview(articleId, submitDto)))
        .rejects.toThrow('Only draft articles can be submitted');
    });
  });

  describe('startReview', () => {
    it('should start review for submitted article', async () => {
      const articleId = 1;
      const mockArticle = TestHelpers.createMockArticle({
        id: articleId,
        status: ArticleStatus.SUBMITTED,
      });

      const updatedArticle = { ...mockArticle, status: ArticleStatus.UNDER_REVIEW };
      
      jest.spyOn(service, 'findOne')
        .mockReturnValueOnce(from([mockArticle]))
        .mockReturnValueOnce(from([updatedArticle]));
      jest.spyOn(repository, 'save').mockResolvedValue(updatedArticle as any);

      const result = await lastValueFrom(service.startReview(articleId));

      expect(result.status).toBe(ArticleStatus.UNDER_REVIEW);
    });

    it('should throw error when starting review on non-submitted article', async () => {
      const articleId = 1;
      const mockArticle = TestHelpers.createMockArticle({
        id: articleId,
        status: ArticleStatus.DRAFT,
      });

      jest.spyOn(service, 'findOne').mockReturnValue(from([mockArticle]));

      await expect(lastValueFrom(service.startReview(articleId)))
        .rejects.toThrow('Only submitted articles can be reviewed');
    });
  });

  describe('approveOrReject', () => {
    it('should approve article successfully', async () => {
      const articleId = 1;
      const approveDto: ApproveArticleDto = { action: ApprovalAction.APPROVE };
      const approverId = 3;

      const mockArticle = TestHelpers.createMockArticle({
        id: articleId,
        status: ArticleStatus.UNDER_REVIEW,
        approverId: undefined,
        version: 1,
      });

      const updatedArticle = { ...mockArticle, status: ArticleStatus.APPROVED, approverId: 3, version: 2 };
      
      jest.spyOn(service, 'findOne')
        .mockReturnValueOnce(from([mockArticle]))
        .mockReturnValueOnce(from([updatedArticle]));
      jest.spyOn(repository, 'save').mockResolvedValue(updatedArticle as any);

      const result = await lastValueFrom(service.approveOrReject(articleId, approveDto, approverId));

      expect(result.status).toBe(ArticleStatus.APPROVED);
      expect(result.approverId).toBe(3);
      expect(result.version).toBe(2);
    });

    it('should reject article successfully', async () => {
      const articleId = 1;
      const approveDto: ApproveArticleDto = { action: ApprovalAction.REJECT };
      const approverId = 3;

      const mockArticle = TestHelpers.createMockArticle({
        id: articleId,
        status: ArticleStatus.UNDER_REVIEW,
        approverId: undefined,
        version: 1,
      });

      const updatedArticle = { ...mockArticle, status: ArticleStatus.REJECTED, approverId: 3, version: 2 };
      
      jest.spyOn(service, 'findOne')
        .mockReturnValueOnce(from([mockArticle]))
        .mockReturnValueOnce(from([updatedArticle]));
      jest.spyOn(repository, 'save').mockResolvedValue(updatedArticle as any);

      const result = await lastValueFrom(service.approveOrReject(articleId, approveDto, approverId));

      expect(result.status).toBe(ArticleStatus.REJECTED);
      expect(result.approverId).toBe(3);
      expect(result.version).toBe(2);
    });

    it('should throw error when approving/rejecting non-under-review article', async () => {
      const articleId = 1;
      const approveDto: ApproveArticleDto = { action: ApprovalAction.APPROVE };
      const approverId = 3;

      const mockArticle = TestHelpers.createMockArticle({
        id: articleId,
        status: ArticleStatus.DRAFT,
      });

      jest.spyOn(service, 'findOne').mockReturnValue(from([mockArticle]));

      await expect(lastValueFrom(service.approveOrReject(articleId, approveDto, approverId)))
        .rejects.toThrow('Only articles under review can be approved/rejected');
    });
  });

  describe('publish', () => {
    it('should publish approved article successfully', async () => {
      const articleId = 1;
      const mockArticle = TestHelpers.createMockArticle({
        id: articleId,
        status: ArticleStatus.APPROVED,
        publishedAt: undefined,
      });

      const updatedArticle = { ...mockArticle, status: ArticleStatus.PUBLISHED, publishedAt: new Date() };
      
      jest.spyOn(service, 'findOne')
        .mockReturnValueOnce(from([mockArticle]))
        .mockReturnValueOnce(from([updatedArticle]));
      jest.spyOn(repository, 'save').mockResolvedValue(updatedArticle as any);

      const result = await lastValueFrom(service.publish(articleId));

      expect(result.status).toBe(ArticleStatus.PUBLISHED);
      expect(result.publishedAt).toBeInstanceOf(Date);
    });

    it('should throw error when publishing non-approved article', async () => {
      const articleId = 1;
      const mockArticle = TestHelpers.createMockArticle({
        id: articleId,
        status: ArticleStatus.REJECTED,
      });

      jest.spyOn(service, 'findOne').mockReturnValue(from([mockArticle]));

      await expect(lastValueFrom(service.publish(articleId)))
        .rejects.toThrow('Only approved articles can be published');
    });
  });

  describe('findAll', () => {
    it('should return all articles with relations', async () => {
      const mockArticles = [
        TestHelpers.createMockArticle({ id: 1 }),
        TestHelpers.createMockArticle({ id: 2 }),
      ];

      jest.spyOn(repository, 'find').mockResolvedValue(mockArticles);

      const result = await lastValueFrom(service.findAll());

      expect(repository.find).toHaveBeenCalledWith({
        relations: {
          author: true,
          editor: true,
          approver: true,
        },
        order: {
          updatedAt: 'DESC',
        },
      });
      expect(result).toEqual(mockArticles);
    });
  });

  describe('findOne', () => {
    it('should return article by id with relations', async () => {
      const articleId = 1;
      const mockArticle = TestHelpers.createMockArticle({ id: articleId });

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockArticle);

      const result = await lastValueFrom(service.findOne(articleId));

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: articleId },
        relations: {
          author: true,
          editor: true,
          approver: true,
        },
      });
      expect(result).toEqual(mockArticle);
    });

    it('should throw error when article not found', async () => {
      const articleId = 999;

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(lastValueFrom(service.findOne(articleId)))
        .rejects.toThrow('Article not found');
    });
  });

  describe('update', () => {
    it('should update article successfully', async () => {
      const articleId = 1;
      const updateDto: UpdateArticleDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const mockArticle = TestHelpers.createMockArticle({
        id: articleId,
        title: 'Original Title',
        content: 'Original content',
        version: 1,
      });

      const updatedArticle = { ...mockArticle, title: 'Updated Title', content: 'Updated content', version: 2 };
      
      jest.spyOn(service, 'findOne')
        .mockReturnValueOnce(from([mockArticle]))
        .mockReturnValueOnce(from([updatedArticle]));
      jest.spyOn(repository, 'save').mockResolvedValue(updatedArticle as any);

      const result = await lastValueFrom(service.update(articleId, updateDto));

      expect(result.title).toBe('Updated Title');
      expect(result.content).toBe('Updated content');
      expect(result.version).toBe(2);
    });

    it('should throw error when updating non-existent article', async () => {
      const articleId = 999;
      const updateDto: UpdateArticleDto = { title: 'Updated Title' };

      jest.spyOn(service, 'findOne').mockReturnValue(throwError(() => new Error('Article not found')));

      await expect(lastValueFrom(service.update(articleId, updateDto)))
        .rejects.toThrow('Article not found');
    });
  });

  describe('remove', () => {
    it('should delete article successfully', async () => {
      const articleId = 1;

      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await lastValueFrom(service.remove(articleId));

      expect(repository.delete).toHaveBeenCalledWith(articleId);
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from title', () => {
      const title = 'Test Article Title';
      const slug = (service as any).generateSlug(title);

      expect(slug).toMatch(/^test-article-title-\d+$/);
    });

    it('should handle special characters in title', () => {
      const title = 'Test Article: Special Characters & More!';
      const slug = (service as any).generateSlug(title);

      expect(slug).toMatch(/^test-article-special-characters-more-\d+$/);
    });

    it('should handle empty title', () => {
      const title = '';
      const slug = (service as any).generateSlug(title);

      expect(slug).toMatch(/^-\d+$/);
    });
  });
});