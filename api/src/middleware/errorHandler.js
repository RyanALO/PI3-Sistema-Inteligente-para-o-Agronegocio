/**
 * Handler global de erros para o Express.
 * Garante respostas JSON padronizadas para qualquer erro não tratado.
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor.';

  return res.status(status).json({
    success: false,
    error: message,
    code: status,
  });
}

module.exports = errorHandler;
