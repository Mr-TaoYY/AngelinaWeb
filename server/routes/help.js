import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

router.get('/categories', (req, res) => {
  const list = db
    .prepare('SELECT * FROM help_categories ORDER BY sort_order ASC, id ASC')
    .all()
    .map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      description: item.description,
      sortOrder: item.sort_order,
    }))
  res.json({ code: 0, data: list })
})

router.post('/categories', (req, res) => {
  const { title, type, description, sortOrder } = req.body || {}
  const info = db
    .prepare(
      `INSERT INTO help_categories (title, type, description, sort_order)
       VALUES (?, ?, ?, ?)`
    )
    .run(title || '', type || 'category', description || '', sortOrder ?? 0)
  res.json({ code: 0, data: { id: info.lastInsertRowid } })
})

router.put('/categories/:id', (req, res) => {
  const { id } = req.params
  const { title, type, description, sortOrder } = req.body || {}
  db.prepare(
    `UPDATE help_categories SET title=?, type=?, description=?, sort_order=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`
  ).run(title || '', type || 'category', description || '', sortOrder ?? 0, id)
  res.json({ code: 0, message: '修改成功' })
})

router.delete('/categories/:id', (req, res) => {
  const { id } = req.params
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM help_items WHERE category_id = ?').run(id)
    db.prepare('DELETE FROM help_categories WHERE id = ?').run(id)
  })
  tx()
  res.json({ code: 0, message: '删除成功' })
})

router.get('/items', (req, res) => {
  const { categoryId } = req.query
  let rows
  if (categoryId) {
    rows = db
      .prepare(
        'SELECT * FROM help_items WHERE category_id = ? ORDER BY sort_order ASC, id ASC'
      )
      .all(categoryId)
  } else {
    rows = db
      .prepare('SELECT * FROM help_items ORDER BY sort_order ASC, id ASC')
      .all()
  }
  const list = rows.map((item) => ({
    id: item.id,
    categoryId: item.category_id,
    name: item.name,
    description: item.description ? JSON.parse(item.description) : [],
    sortOrder: item.sort_order,
  }))
  res.json({ code: 0, data: list })
})

router.post('/items', (req, res) => {
  const { categoryId, name, description, sortOrder } = req.body || {}
  const descStr = Array.isArray(description)
    ? JSON.stringify(description)
    : description || '[]'
  const info = db
    .prepare(
      `INSERT INTO help_items (category_id, name, description, sort_order)
       VALUES (?, ?, ?, ?)`
    )
    .run(categoryId || 0, name || '', descStr, sortOrder ?? 0)
  res.json({ code: 0, data: { id: info.lastInsertRowid } })
})

router.put('/items/:id', (req, res) => {
  const { id } = req.params
  const { categoryId, name, description, sortOrder } = req.body || {}
  const descStr = Array.isArray(description)
    ? JSON.stringify(description)
    : description || '[]'
  db.prepare(
    `UPDATE help_items SET category_id=?, name=?, description=?, sort_order=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`
  ).run(categoryId || 0, name || '', descStr, sortOrder ?? 0, id)
  res.json({ code: 0, message: '修改成功' })
})

router.delete('/items/:id', (req, res) => {
  const { id } = req.params
  db.prepare('DELETE FROM help_items WHERE id = ?').run(id)
  res.json({ code: 0, message: '删除成功' })
})

export default router
