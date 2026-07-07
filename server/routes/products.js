import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

// ============ 分类管理 ============

// 获取所有分类（树形）
router.get('/categories', (req, res) => {
  const categories = db
    .prepare('SELECT * FROM product_category ORDER BY sort_order ASC, id ASC')
    .all()
    .map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      parentId: c.parent_id,
      sortOrder: c.sort_order,
    }))
  res.json({ code: 0, data: categories })
})

// 新增分类
router.post('/categories', (req, res) => {
  const { name, type, parentId, sortOrder } = req.body || {}
  if (!name) return res.status(400).json({ code: 400, message: '分类名称不能为空' })
  const info = db
    .prepare('INSERT INTO product_category (name, type, parent_id, sort_order) VALUES (?, ?, ?, ?)')
    .run(name, type || 'major', parentId || null, sortOrder ?? 0)
  res.json({ code: 0, data: { id: info.lastInsertRowid } })
})

// 修改分类
router.put('/categories/:id', (req, res) => {
  const { id } = req.params
  const { name, type, parentId, sortOrder } = req.body || {}
  db.prepare(
    `UPDATE product_category SET name=?, type=?, parent_id=?, sort_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
  ).run(name || '', type || 'major', parentId || null, sortOrder ?? 0, id)
  res.json({ code: 0, message: '修改成功' })
})

// 删除分类
router.delete('/categories/:id', (req, res) => {
  const { id } = req.params
  // 检查是否有子分类
  const children = db.prepare('SELECT COUNT(*) as count FROM product_category WHERE parent_id = ?').get(id)
  if (children.count > 0) {
    return res.status(400).json({ code: 400, message: '请先删除子分类' })
  }
  // 检查是否有关联产品
  const products = db.prepare('SELECT COUNT(*) as count FROM product WHERE category_id = ?').get(id)
  if (products.count > 0) {
    return res.status(400).json({ code: 400, message: '该分类下还有产品，请先移除产品' })
  }
  db.prepare('DELETE FROM product_category WHERE id = ?').run(id)
  res.json({ code: 0, message: '删除成功' })
})

// ============ 产品管理 ============

// 获取产品列表（支持分类筛选）
router.get('/', (req, res) => {
  const { categoryId, keyword } = req.query
  let sql = `
    SELECT p.*, c.name as category_name, c.parent_id as parent_category_id,
      pc.name as parent_category_name
    FROM product p
    LEFT JOIN product_category c ON p.category_id = c.id
    LEFT JOIN product_category pc ON c.parent_id = pc.id
    WHERE 1=1
  `
  const params = []
  if (categoryId) {
    sql += ` AND p.category_id = ?`
    params.push(categoryId)
  }
  if (keyword) {
    sql += ` AND (p.name LIKE ? OR p.spec LIKE ? OR p.license LIKE ?)`
    const kw = `%${keyword}%`
    params.push(kw, kw, kw)
  }
  sql += ` ORDER BY p.sort_order ASC, p.id ASC`

  const list = db.prepare(sql).all(...params).map((p) => ({
    id: p.id,
    categoryId: p.category_id,
    categoryName: p.category_name,
    parentCategoryId: p.parent_category_id,
    parentCategoryName: p.parent_category_name,
    name: p.name,
    license: p.license,
    spec: p.spec,
    price: p.price,
    image: p.image,
    linkUrl: p.link_url || '',
    sortOrder: p.sort_order,
  }))
  res.json({ code: 0, data: list })
})

// 新增产品
router.post('/', (req, res) => {
  const { categoryId, name, license, spec, price, image, linkUrl, sortOrder } = req.body || {}
  if (!name) return res.status(400).json({ code: 400, message: '产品名称不能为空' })
  const info = db
    .prepare(
      `INSERT INTO product (category_id, name, license, spec, price, image, link_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(categoryId || null, name, license || '', spec || '', price || 0, image || '', linkUrl || '', sortOrder ?? 0)
  res.json({ code: 0, data: { id: info.lastInsertRowid } })
})

// 修改产品
router.put('/:id', (req, res) => {
  const { id } = req.params
  const { categoryId, name, license, spec, price, image, linkUrl, sortOrder } = req.body || {}
  db.prepare(
    `UPDATE product SET category_id=?, name=?, license=?, spec=?, price=?, image=?, link_url=?, sort_order=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`
  ).run(categoryId || null, name || '', license || '', spec || '', price || 0, image || '', linkUrl || '', sortOrder ?? 0, id)
  res.json({ code: 0, message: '修改成功' })
})

// 删除产品
router.delete('/:id', (req, res) => {
  const { id } = req.params
  db.prepare('DELETE FROM product WHERE id = ?').run(id)
  res.json({ code: 0, message: '删除成功' })
})

export default router
