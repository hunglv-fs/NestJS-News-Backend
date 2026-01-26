export const loggingConfig = () => ({
    level: process.env.LOG_LEVEL ?? 'info',
});
