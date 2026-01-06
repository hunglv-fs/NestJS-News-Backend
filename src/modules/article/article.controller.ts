import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { SubmitArticleDto } from './dto/submit-article.dto';
import { ApproveArticleDto } from './dto/approve-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';
import { Observable } from 'rxjs';

@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post('draft')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('articles:create')
  @ApiOperation({ summary: 'Create draft article' })
  createDraft(@Body() createArticleDto: CreateArticleDto): Observable<any> {
    return this.articleService.createDraft(createArticleDto);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('articles:update')
  @ApiOperation({ summary: 'Submit article for review' })
  submitForReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitDto: SubmitArticleDto
  ): Observable<any> {
    return this.articleService.submitForReview(id, submitDto);
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('articles:update')
  @ApiOperation({ summary: 'Start article review' })
  startReview(@Param('id', ParseIntPipe) id: number): Observable<any> {
    return this.articleService.startReview(id);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('articles:approve')
  @ApiOperation({ summary: 'Approve or reject article' })
  approveOrReject(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveDto: ApproveArticleDto,
    @Request() req: any
  ): Observable<any> {
    return this.articleService.approveOrReject(id, approveDto, req.user.sub);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('articles:publish')
  @ApiOperation({ summary: 'Publish approved article' })
  publish(@Param('id', ParseIntPipe) id: number): Observable<any> {
    return this.articleService.publish(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  findAll(): Observable<any[]> {
    return this.articleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID' })
  findOne(@Param('id', ParseIntPipe) id: number): Observable<any> {
    return this.articleService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('articles:update')
  @ApiOperation({ summary: 'Update article' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto
  ): Observable<any> {
    return this.articleService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('articles:delete')
  @ApiOperation({ summary: 'Delete article' })
  remove(@Param('id', ParseIntPipe) id: number): Observable<any> {
    return this.articleService.remove(id);
  }
}