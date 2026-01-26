import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runSeed() {
    // Create a Nest application context to get ConfigService & DataSource
    const app = await NestFactory.createApplicationContext(AppModule);
    const configService = app.get(ConfigService);
    const dataSource = app.get(DataSource);

    try {
        console.log('🔄 Connecting to database...');
        await dataSource.initialize();
        console.log('✅ Database connected successfully');

        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();

        // Clean existing data
        console.log('🧹 Cleaning existing data...');
        const tableNames = dataSource.entityMetadatas
            .map((entity) => `"${entity.tableName}"`)
            .join(', ');

        if (tableNames.length > 0) {
            await queryRunner.query(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);
            console.log('✅ Tables truncated');
        }

        // Run seed-workflow.sql (more complete version)
        const seedFilePath = join(__dirname, '../../seed-workflow.sql');
        console.log(`📂 Reading seed file: ${seedFilePath}`);

        const seedSQL = readFileSync(seedFilePath, 'utf8');

        console.log('🌱 Executing seed data...');
        await queryRunner.query(seedSQL);

        await queryRunner.release();

        console.log('✅ Database seeded successfully!');
        console.log('\n📊 Seeded data:');
        console.log('  - Roles: admin');
        console.log('  - Permissions: 10 permissions');
        console.log('  - Users: admin@example.com, editor@example.com, reporter@example.com');
        console.log('  - Articles: 3 sample articles');
        console.log('\n🔑 Default password for all users: password123');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        process.exit(1);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
            console.log('🔌 Database connection closed');
        }
        await app.close();
    }
}

// Run the seed function
runSeed();
