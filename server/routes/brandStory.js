import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

router.get('/', (req, res) => {
  const list = db
    .prepare('SELECT * FROM brand_story ORDER BY sort_order ASC, id ASC')
    .all()
    .map((item) => ({
      id: item.id,
      type: item.type,
      imagePc: item.image_pc,
      imageTablet: item.image_tablet,
      imageMobile: item.image_mobile,
      videoUrl: item.video_url,
      sortOrder: item.sort_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))
  res.json({ code: 0, data: list })
})

router.post('/', (req, res) => {
  const { type, imagePc, imageTablet, imageMobile, videoUrl, sortOrder } = req.body || {}
  const info = db
    .prepare(
      `INSERT INTO brand_story (type, image_pc, image_tablet, image_mobile, video_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      type || 'image',
      imagePc || '',
      imageTablet || '',
      imageMobile || '',
      videoUrl || '',
      sortOrder ?? 0
    )
  res.json({ code: 0, data: { id: info.lastInsertRowid } })
})

router.put('/:id', (req, res) => {
  const { id } = req.params
  const { type, imagePc, imageTablet, imageMobile, videoUrl, sortOrder } = req.body || {}
  db.prepare(
    `UPDATE brand_story SET type=?, image_pc=?, image_tablet=?, image_mobile=?, video_url=?, sort_order=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`
  ).run(
    type || 'image',
    imagePc || '',
    imageTablet || '',
    imageMobile || '',
    videoUrl || '',
    sortOrder ?? 0,
    id
  )
  res.json({ code: 0, message: '修改成功' })
})

router.delete('/:id', (req, res) => {
  const { id } = req.params
  db.prepare('DELETE FROM brand_story WHERE id = ?').run(id)
  res.json({ code: 0, message: '删除成功' })
})

export default router
