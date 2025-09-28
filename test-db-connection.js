require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function testConnection() {
    console.log('Testing MySQL database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT || 3306);
    console.log('Database:', process.env.DB_NAME || 'mikes_macaroon_market');
    console.log('User:', process.env.DB_USER);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME || 'mikes_macaroon_market',
            ssl: fs.existsSync('global-bundle.pem') ? {
                ca: fs.readFileSync('global-bundle.pem').toString()
            } : false
        });

        console.log('✅ Successfully connected to MySQL database!');

        // Test a simple query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Test query successful:', rows[0]);

        await connection.end();
        console.log('✅ Connection closed successfully');

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
    }
}

testConnection();