import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file
config();

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    synchronize: false, // Set to false for production safety
    logging: ['error', 'warn', 'migration'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
