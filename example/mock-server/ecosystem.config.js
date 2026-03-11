module.exports = {
  apps: [
    {
      name: 'codepush-server',
      script: 'server-supabase.js',
      cwd: './example/mock-server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3080
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3080
      }
    }
  ]
}; 