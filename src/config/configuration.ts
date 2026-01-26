import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { jwtConfig } from './jwt.config';
import { loggingConfig } from './logging.config';

export const configuration = () => ({
  ...appConfig(),
  ...databaseConfig(),
  ...jwtConfig(),
  ...loggingConfig(),
});