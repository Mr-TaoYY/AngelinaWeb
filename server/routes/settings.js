import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

// 获取全部配置
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_config ORDER BY key ASC').all()
  const data = {}
  rows.forEach((r) => (data[r.key] = r.value))
  res.json({ code: 0, data })
})

// 获取单个配置
router.get('/:key', (req, res) => {
  const row = db.prepare('SELECT value FROM site_config WHERE key = ?').get(req.params.key)
  res.json({ code: 0, data: row ? row.value : '' })
})

// UPSERT 更新单个配置
router.put('/:key', (req, res) => {
  const { key } = req.params
  const { value } = req.body || {}
  db.prepare(
    `INSERT INTO site_config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
  ).run(key, value || '')
  res.json({ code: 0, message: '保存成功' })
})

export default router
