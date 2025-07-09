module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: "production",
        APP_ENV: "staging",
        PORT: 3000
      },
      watch: true,
      ignore_watch: ['node_modules']
    }
  ]
};
