const jwt = require('jsonwebtoken');
const config = require('../config/env');

module.exports = (req, res, next) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Token de acesso não fornecido'
      });
    }

    // Verificar formato do token (Bearer <token>)
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    // Verificar e decodificar o token
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Token expirado'
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            error: 'Token inválido'
          });
        }

        return res.status(401).json({
          error: 'Erro na verificação do token'
        });
      }

      // Token válido, adicionar dados do usuário ao request
      req.user = decoded;
      next();
    });

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
}; 