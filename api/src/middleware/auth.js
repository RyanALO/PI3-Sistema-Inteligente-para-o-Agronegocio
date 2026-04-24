const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação JWT.
 * Verifica o header Authorization: Bearer <token>
 * e injeta req.user com os dados do payload.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação ausente ou inválido.',
      code: 401,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado. Faça login novamente.',
        code: 401,
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Token inválido.',
      code: 401,
    });
  }
}

module.exports = authMiddleware;
