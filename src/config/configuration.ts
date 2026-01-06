export const configuration = () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'jwt-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret-key',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
});