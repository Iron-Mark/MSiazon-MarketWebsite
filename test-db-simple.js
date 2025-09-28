require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

async function testConnectionWithoutDB() {
    console.log('Testing MySQL connection without specifying database...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT || 3306);
    console.log('User:', process.env.DB_USER);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            // No database specified
            ssl: fs.existsSync('global-bundle.pem') ? {
                ca: fs.readFileSync('global-bundle.pem').toString()
            } : false
        });

        console.log('✅ Successfully connected to MySQL server!');

        // List available databases
        const [rows] = await connection.execute('SHOW DATABASES');
        console.log('Available databases:');
        rows.forEach(row => {
            console.log(`  - ${row.Database}`);
        });

        // Try to create the database if it doesn't exist
        const dbName = process.env.DB_NAME || 'mikes_macaroon_market';
        try {
            await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
            console.log(`✅ Database '${dbName}' created or already exists`);
        } catch (createError) {
            console.error('❌ Error creating database:', createError.message);
        }

        await connection.end();
        console.log('✅ Connection closed successfully');

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }

        // Provide troubleshooting tips
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Check if your RDS security group allows connections from your IP address');
        console.log('2. Verify that your RDS instance is publicly accessible (if connecting from outside AWS)');
        console.log('3. Confirm your database credentials are correct');
        console.log('4. Make sure the RDS instance is in the \'available\' state');
    }
}

testConnectionWithoutDB();