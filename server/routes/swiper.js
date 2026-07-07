import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

router.get('/', (req, res) => {
  const list = db
    .prepare('SELECT * FROM swiper ORDER BY sort_order ASC, id ASC')
    .all()
    .map((item) => ({
      id: item.id,
      imagePc: item.image_pc,
      imageTablet: item.image_tablet,
      imageMobile: item.image_mobile,
      sortOrder: item.sort_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))
  res.json({ code: 0, data: list })
})

router.post('/', (req, res) => {
  const { imagePc, imageTablet, imageMobile, sortOrder } = req.body || {}
  const info = db
    .prepare(
      `INSERT INTO swiper (image_pc, image_tablet, image_mobile, sort_order)
       VALUES (?, ?, ?, ?)`
    )
    .run(imagePc || '', imageTablet || '', imageMobile || '', sortOrder ?? 0)
  res.json({ code: 0, data: { id: info.lastInsertRowid } })
})

router.put('/:id', (req, res) => {
  const { id } = req.params
  const { imagePc, imageTablet, imageMobile, sortOrder } = req.body || {}
  db.prepare(
    `UPDATE swiper SET image_pc=?, image_tablet=?, image_mobile=?, sort_order=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`
  ).run(imagePc || '', imageTablet || '', imageMobile || '', sortOrder ?? 0, id)
  res.json({ code: 0, message: '修改成功' })
})

router.delete('/:id', (req, res) => {
  const { id } = req.params
  db.prepare('DELETE FROM swiper WHERE id = ?').run(id)
  res.json({ code: 0, message: '删除成功' })
})

export default router
