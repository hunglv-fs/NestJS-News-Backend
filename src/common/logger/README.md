# Winston Logger với AWS CloudWatch

Module logging tùy chỉnh sử dụng Winston và AWS CloudWatch.

## Cấu hình

Thêm các biến môi trường sau vào `.env`:

```env
# Logging
LOG_LEVEL=debug

# AWS CloudWatch (tùy chọn)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_CLOUDWATCH_LOG_GROUP=nestjs-news-backend
```

## Sử dụng

```typescript
import { CustomLoggerService } from '../common/logger/logger.service';

@Injectable()
export class YourService {
  constructor(private readonly logger: CustomLoggerService) {}

  async yourMethod() {
    try {
      this.logger.log('Operation started', 'YourService');
      // Business logic
      this.logger.log('Operation completed', 'YourService');
    } catch (error) {
      this.logger.error('Operation failed', error.stack, 'YourService');
      throw error;
    }
  }
}
```

## Tính năng

- **Console logging** với màu sắc
- **AWS CloudWatch** tự động (nếu có cấu hình AWS)
- **Structured logging** với JSON format
- **Error tracking** với stack trace
- **Context-aware** logging