interface Config {
    API_URL: string;
    DATABASE: {
        host: string;
        user: string;
        password: string;
        database: string;
    };
}

export const config: Config = {
    API_URL: import.meta.env.VITE_API_URL || (
        import.meta.env.MODE === 'production' 
            ? 'https://familjenfalth.se/eankbt/php-backend/api' 
            : 'http://localhost/soccer_tips/php-backend/api'
    ),
    DATABASE: {
        host: 'your-database-host',
        user: 'your-database-user',
        password: 'your-database-password',
        database: 'your-database-name'
    }
};
