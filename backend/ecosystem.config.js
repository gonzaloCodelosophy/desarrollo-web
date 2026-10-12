export default {
  apps: [
    {
      name: 'clinica-turnos-backend',
      script: 'dist/main.js',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
