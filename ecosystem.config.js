module.exports = {
    apps: [
        {
            name: 'macaroon-backend',
            script: './backend/server.js',
            cwd: '/home/ec2-user/MSiazon-MarketWebsite',
            instances: 1,
            exec_mode: 'fork',
            env_production: {
                NODE_ENV: 'production',
                PORT: 8080
            },
            error_file: './logs/backend-error.log',
            out_file: './logs/backend-out.log',
            log_file: './logs/backend-combined.log',
            time: true,
            max_memory_restart: '500M',
            node_args: '--max_old_space_size=1024'
        },
        {
            name: 'macaroon-frontend',
            // Custom lightweight static server (frontend-server.js) avoids serve CLI arg parsing issues.
            script: 'node',
            args: ['frontend-server.js'],
            cwd: '/home/ec2-user/MSiazon-MarketWebsite',
            instances: 1,
            exec_mode: 'fork',
            env_production: {
                NODE_ENV: 'production',
                FRONTEND_PORT: 3000
            },
            error_file: './logs/frontend-error.log',
            out_file: './logs/frontend-out.log',
            log_file: './logs/frontend-combined.log',
            time: true,
            max_memory_restart: '200M'
        }
    ]
};