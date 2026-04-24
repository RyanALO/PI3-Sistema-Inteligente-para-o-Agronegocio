const express = require('express');
const pool = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /estoque:
 *   get:
 *     summary: Listar itens de estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fazenda_id
 *         schema: { type: integer }
 *       - in: query
 *         name: tipo
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de itens de estoque
 */
router.get('/', async (req, res, next) => {
  try {
    const { fazenda_id, tipo } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (fazenda_id) {
      conditions.push(`e.fazenda_id = $${idx++}`);
      params.push(Number(fazenda_id));
    }
    if (tipo) {
      conditions.push(`e.tipo = $${idx++}`);
      params.push(tipo);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(`
      SELECT
        e.*,
        f.nome AS fazenda,
        CASE WHEN e.data_validade < CURRENT_DATE THEN true ELSE false END AS vencido,
        CASE WHEN e.data_validade < CURRENT_DATE + INTERVAL '30 days' AND e.data_validade >= CURRENT_DATE THEN true ELSE false END AS vence_em_breve
      FROM estoque e
      LEFT JOIN fazenda f ON f.id = e.fazenda_id
      ${where}
      ORDER BY e.nome_produto
    `, params);

    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /estoque/{id}:
 *   get:
 *     summary: Detalhes de um item de estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Item encontrado
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT e.*, f.nome AS fazenda FROM estoque e LEFT JOIN fazenda f ON f.id = e.fazenda_id WHERE e.id = $1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item não encontrado.', code: 404 });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /estoque:
 *   post:
 *     summary: Adicionar item ao estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fazenda_id, nome_produto, tipo, quantidade]
 *             properties:
 *               fazenda_id: { type: integer }
 *               nome_produto: { type: string }
 *               tipo: { type: string, example: fertilizante }
 *               quantidade: { type: number }
 *               custo_unitario: { type: number }
 *               data_validade: { type: string, format: date }
 *               fornecedor: { type: string }
 *     responses:
 *       201:
 *         description: Item criado
 */
router.post('/', async (req, res, next) => {
  try {
    const { fazenda_id, nome_produto, tipo, quantidade, custo_unitario, data_validade, fornecedor } = req.body;

    if (!fazenda_id || !nome_produto || !tipo || quantidade === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: fazenda_id, nome_produto, tipo, quantidade.',
        code: 400,
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO estoque (fazenda_id, nome_produto, tipo, quantidade, custo_unitario, data_validade, fornecedor)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [fazenda_id, nome_produto, tipo, quantidade, custo_unitario || null, data_validade || null, fornecedor || null]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /estoque/{id}:
 *   put:
 *     summary: Atualizar item de estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantidade: { type: number }
 *               custo_unitario: { type: number }
 *     responses:
 *       200:
 *         description: Atualizado com sucesso
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { nome_produto, tipo, quantidade, custo_unitario, data_validade, fornecedor } = req.body;

    const { rows } = await pool.query(
      `UPDATE estoque SET
        nome_produto  = COALESCE($1, nome_produto),
        tipo          = COALESCE($2, tipo),
        quantidade    = COALESCE($3, quantidade),
        custo_unitario = COALESCE($4, custo_unitario),
        data_validade = COALESCE($5, data_validade),
        fornecedor    = COALESCE($6, fornecedor)
       WHERE id = $7 RETURNING *`,
      [nome_produto, tipo, quantidade, custo_unitario, data_validade, fornecedor, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item não encontrado.', code: 404 });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /estoque/{id}:
 *   delete:
 *     summary: Remover item de estoque
 *     tags: [Estoque]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Removido com sucesso
 *       404:
 *         description: Não encontrado
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM estoque WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item não encontrado.', code: 404 });
    }
    return res.json({ success: true, message: `Item ${req.params.id} removido.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
