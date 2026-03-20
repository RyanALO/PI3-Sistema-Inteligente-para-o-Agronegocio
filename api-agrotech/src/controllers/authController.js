const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'WvNbrUHw1C15D1Cyc4SGJJkldjvTgE7n'; // mude isso!

exports.login = (req, res) => {
  const { email, password } = req.body;

  // Simulação simples (depois vem do banco)
  if (email === 'teste@agri.com' && password === '123456') {
    const user = { id: 1, email, name: 'Gustavo Agricultor' };
    const token = jwt.sign(user, SECRET, { expiresIn: '8h' });
    return res.json({ token, user });
  }

  return res.status(401).json({ error: 'Credenciais inválidas' });
};