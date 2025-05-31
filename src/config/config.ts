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
            ? 'https://familjenfalth.se/vm2026/api' 
            : 'http://localhost:3001/api'
    ),
    DATABASE: {
        host: 'familjenfalth.se.mysql',
        user: 'familjenfalth_senr2',
        password: 'kesokeso',
        database: 'familjenfalth_senr2'
    }
};
