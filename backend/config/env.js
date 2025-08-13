module.exports = {
  // Configurações do Banco de Dados
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'postgres',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'July@100312',

  // Configurações do Servidor
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // JWT Secret
  JWT_SECRET: process.env.JWT_SECRET || 'corrida_app_super_secret_key_2024',

  // Configurações de Rate Limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,

  // Configurações de Upload
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5242880,
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads'
}; 