module.exports = {
    apps: [
        {
            name: 'backend',
            script: 'server.js',
            env: {
                NODE_ENV: 'staging',
                PORT: 3001
            },
            watch: true,
            ignore_watch: ['node_modules']
        }
    ]
};