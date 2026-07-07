import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

router.get('/', (req, res) => {
  const list = db
    .prepare('SELECT * FROM channels ORDER BY sort_order ASC, id ASC')
    .all()
    .map((item) => ({
      id: item.id,
      store: item.store,
      title: item.title,
      type: item.type,
      url: item.url,
      sortOrder: item.sort_order,
    }))
  res.json({ code: 0, data: list })
})

router.post('/', (req, res) => {
  const { store, title, type, url, sortOrder } = req.body || {}
  const info = db
    .prepare(
      `INSERT INTO channels (store, title, type, url, sort_order)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(store || '', title || '', type || 'href', url || '', sortOrder ?? 0)
  res.json({ code: 0, data: { id: info.lastInsertRowid } })
})

router.put('/:id', (req, res) => {
  const { id } = req.params
  const { store, title, type, url, sortOrder } = req.body || {}
  db.prepare(
    `UPDATE channels SET store=?, title=?, type=?, url=?, sort_order=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`
  ).run(store || '', title || '', type || 'href', url || '', sortOrder ?? 0, id)
  res.json({ code: 0, message: '修改成功' })
})

router.delete('/:id', (req, res) => {
  const { id } = req.params
  db.prepare('DELETE FROM channels WHERE id = ?').run(id)
  res.json({ code: 0, message: '删除成功' })
})

export default router
