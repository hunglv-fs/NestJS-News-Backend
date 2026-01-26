export const jwtConfig = () => ({
    jwt: {
        secret: process.env.JWT_SECRET ?? 'jwt-secret-key',
        refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'jwt-refresh-secret-key',
    },
});
