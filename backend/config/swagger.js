const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🏃‍♂️ Corrida App API',
      version: '1.0.0',
      description: 'API completa para o aplicativo de corrida social com GPS, música sincronizada e corridas em grupo',
      contact: {
        name: 'Anderson Pereira',
        email: 'anderson@corridaapp.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.corridaapp.com',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            username: { type: 'string' },
            avatar_url: { type: 'string' },
            bio: { type: 'string' },
            birth_date: { type: 'string', format: 'date' },
            gender: { type: 'string' },
            weight: { type: 'number' },
            height: { type: 'number' },
            level: { type: 'integer' },
            total_distance: { type: 'number' },
            total_runs: { type: 'integer' },
            total_time: { type: 'integer' },
            average_pace: { type: 'number' },
            calories_burned: { type: 'integer' },
            join_date: { type: 'string', format: 'date-time' },
            last_login: { type: 'string', format: 'date-time' },
            is_active: { type: 'boolean' },
            is_verified: { type: 'boolean' }
          }
        },
        RunningSession: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            start_time: { type: 'string', format: 'date-time' },
            end_time: { type: 'string', format: 'date-time' },
            distance: { type: 'number' },
            duration: { type: 'integer' },
            average_pace: { type: 'number' },
            average_speed: { type: 'number' },
            max_speed: { type: 'number' },
            calories: { type: 'integer' },
            steps: { type: 'integer' },
            is_group_run: { type: 'boolean' }
          }
        },
        MusicSession: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            host_id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            is_public: { type: 'boolean' },
            max_participants: { type: 'integer' },
            current_track_id: { type: 'string' },
            is_playing: { type: 'boolean' },
            track_position: { type: 'integer' },
            volume: { type: 'number' }
          }
        },
        Achievement: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' },
            category: { type: 'string', enum: ['distance', 'speed', 'consistency', 'social', 'special'] },
            progress: { type: 'integer' },
            target: { type: 'integer' },
            is_unlocked: { type: 'boolean' }
          }
        },
        Challenge: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['distance', 'time', 'pace', 'streak'] },
            target_value: { type: 'number' },
            unit: { type: 'string' },
            start_date: { type: 'string', format: 'date-time' },
            end_date: { type: 'string', format: 'date-time' },
            is_public: { type: 'boolean' },
            is_active: { type: 'boolean' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs; 