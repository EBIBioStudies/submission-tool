module.exports = {
    apps: [{
      name: 'biostudies-submission-tool',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'development', PORT: 8080 },
      env_beta: { NODE_ENV: 'beta', PORT: 8080 },
      env_production: { NODE_ENV: 'production', PORT: 8080 },
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      time: true,
      merge_logs: false,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000
    }]
  };