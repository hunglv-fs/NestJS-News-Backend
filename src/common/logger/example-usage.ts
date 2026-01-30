import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../../common/logger/logger.service';

@Injectable()
export class ExampleService {
  constructor(private readonly logger: CustomLoggerService) {}

  async someMethod() {
    try {
      this.logger.log('Starting some operation', 'ExampleService');
      
      // Your business logic here
      
      this.logger.log('Operation completed successfully', 'ExampleService');
    } catch (error) {
      this.logger.error(
        'Operation failed',
        error instanceof Error ? error.stack : undefined,
        'ExampleService'
      );
      throw error;
    }
  }
}