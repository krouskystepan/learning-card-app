module.exports = {
  apps: [
    {
      name: 'learning-cards',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3002',
      cwd: '/var/www/apps/learning-cards',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
