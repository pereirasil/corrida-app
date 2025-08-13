const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/env');
const swaggerSpecs = require('./config/swagger');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const runningRoutes = require('./routes/running');
const musicRoutes = require('./routes/music');
const friendRoutes = require('./routes/friends');
const achievementRoutes = require('./routes/achievements');

const app = express();

// =====================================================
// MIDDLEWARES DE SEGURANÇA
// =====================================================

// Helmet para headers de segurança
app.use(helmet());

// CORS configurado
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'exp://192.168.0.127:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Muitas requisições. Tente novamente em alguns minutos.',
    retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// =====================================================
// MIDDLEWARES DE PROCESSAMENTO
// =====================================================

// Parser para JSON
app.use(express.json({ limit: '10mb' }));

// Parser para dados de formulário
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================================================
// MIDDLEWARE DE LOG
// =====================================================

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// =====================================================
// SWAGGER DOCUMENTATION
// =====================================================

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: '🏃‍♂️ Corrida App API - Documentação',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true
  }
}));

// =====================================================
// ROTAS
// =====================================================

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: '🏃‍♂️ Corrida App API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      running: '/api/running',
      music: '/api/music',
      friends: '/api/friends',
      achievements: '/api/achievements'
    }
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
    database: 'connected',
    version: '1.0.0'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/running', runningRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/achievements', achievementRoutes);

// =====================================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// =====================================================

// 404 - Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET / - Informações da API',
      'GET /health - Status do servidor',
      'GET /api-docs - Documentação Swagger',
      'POST /api/auth/register - Registro de usuário',
      'POST /api/auth/login - Login de usuário',
      'GET /api/users/profile - Perfil do usuário',
      'POST /api/running/sessions - Iniciar corrida',
      'GET /api/music/sessions - Sessões de música',
      'GET /api/friends/list - Lista de amigos',
      'GET /api/achievements/user - Conquistas do usuário'
    ]
  });
});

// Tratamento global de erros
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';
  
  res.status(statusCode).json({
    error: message,
    ...(config.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// =====================================================
// INICIALIZAÇÃO DO SERVIDOR
// =====================================================

const PORT = config.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor iniciado com sucesso!');
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌍 Ambiente: ${config.NODE_ENV}`);
  console.log(`🌐 Host: 0.0.0.0 (todas as interfaces)`);
  console.log(`📚 Documentação: http://localhost:${PORT}/api-docs`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌐 Rede: http://192.168.0.127:${PORT}`);
  console.log(`⏰ ${new Date().toLocaleString('pt-BR')}`);
  console.log('=====================================');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app; 