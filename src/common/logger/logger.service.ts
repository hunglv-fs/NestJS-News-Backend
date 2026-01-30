import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as CloudWatchTransport from 'winston-cloudwatch';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger!: winston.Logger;

  constructor(private configService: ConfigService) {
    this.createLogger();
  }

  private createLogger() {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
            return `${timestamp} [${context}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
          }),
        ),
      }),
    ];

    // Add CloudWatch transport if AWS credentials are configured
    const awsRegion = this.configService.get('AWS_REGION');
    const awsAccessKey = this.configService.get('AWS_ACCESS_KEY_ID');
    const awsSecretKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    
    if (awsRegion && awsAccessKey && awsSecretKey) {
      try {
        transports.push(
          new CloudWatchTransport({
            logGroupName: this.configService.get('AWS_CLOUDWATCH_LOG_GROUP', 'nestjs-news-backend'),
            logStreamName: `${this.configService.get('NODE_ENV', 'development')}-${new Date().toISOString().split('T')[0]}`,
            awsRegion,
            awsAccessKeyId: awsAccessKey,
            awsSecretKey: awsSecretKey,
            messageFormatter: ({ level, message, additionalInfo }) => {
              return `[${level}] ${message} ${additionalInfo ? JSON.stringify(additionalInfo) : ''}`;
            },
          }),
        );
        console.log('CloudWatch logging enabled');
      } catch (error) {
        console.warn('CloudWatch transport failed to initialize:', error instanceof Error ? error.message : String(error));
      }
    } else {
      console.log('CloudWatch logging disabled - missing AWS credentials');
    }

    this.logger = winston.createLogger({
      level: this.configService.get('LOG_LEVEL', 'info'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports,
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}