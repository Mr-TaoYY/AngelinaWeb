import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/swiper', (req, res) => {
  const list = db
    .prepare('SELECT * FROM swiper ORDER BY sort_order ASC, id ASC')
    .all()
    .map((item) => ({
      id: item.id,
      imagePc: item.image_pc,
      imageTablet: item.image_tablet,
      imageMobile: item.image_mobile,
      sortOrder: item.sort_order,
    }))
  res.json({ code: 0, data: list })
})

router.get('/channels', (req, res) => {
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

router.get('/help', (req, res) => {
  const categories = db
    .prepare('SELECT * FROM help_categories ORDER BY sort_order ASC, id ASC')
    .all()
  const items = db
    .prepare('SELECT * FROM help_items ORDER BY sort_order ASC, id ASC')
    .all()

  const itemMap = {}
  items.forEach((item) => {
    if (!itemMap[item.category_id]) itemMap[item.category_id] = []
    itemMap[item.category_id].push({
      id: item.id,
      name: item.name,
      description: item.description ? JSON.parse(item.description) : [],
    })
  })

  const result = categories.map((cat) => ({
    id: cat.id,
    title: cat.title,
    type: cat.type,
    description: cat.description,
    children: cat.type === 'category' ? itemMap[cat.id] || [] : undefined,
  }))

  res.json({ code: 0, data: result })
})

router.get('/brand-story', (req, res) => {
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
    }))
  res.json({ code: 0, data: list })
})

// 获取产品分类树
router.get('/product-categories', (req, res) => {
  const categories = db
    .prepare('SELECT * FROM product_category ORDER BY sort_order ASC, id ASC')
    .all()

  const majors = categories
    .filter((c) => c.type === 'major')
    .map((m) => ({
      id: m.id,
      name: m.name,
      sortOrder: m.sort_order,
      children: categories
        .filter((c) => c.parent_id === m.id)
        .map((c) => ({
          id: c.id,
          name: c.name,
          sortOrder: c.sort_order,
        })),
    }))

  res.json({ code: 0, data: majors })
})

// 获取产品列表（支持分类筛选和搜索）
router.get('/products', (req, res) => {
  const { majorId, minorId, keyword } = req.query
  let sql = `
    SELECT p.id, p.name, p.license, p.spec, p.price, p.image, p.link_url, p.sort_order,
      c.name as minor_category, c.id as minor_id,
      pc.name as major_category, pc.id as major_id
    FROM product p
    LEFT JOIN product_category c ON p.category_id = c.id
    LEFT JOIN product_category pc ON c.parent_id = pc.id
    WHERE 1=1
  `
  const params = []
  if (majorId) {
    sql += ` AND pc.id = ?`
    params.push(majorId)
  }
  if (minorId) {
    sql += ` AND c.id = ?`
    params.push(minorId)
  }
  if (keyword) {
    sql += ` AND (p.name LIKE ? OR p.spec LIKE ? OR p.license LIKE ?)`
    const kw = `%${keyword}%`
    params.push(kw, kw, kw)
  }
  sql += ` ORDER BY p.sort_order ASC, p.id ASC`

  const list = db.prepare(sql).all(...params).map((p) => ({
    id: p.id,
    name: p.name,
    license: p.license,
    spec: p.spec,
    price: p.price,
    image: p.image,
    linkUrl: p.link_url || '',
    sortOrder: p.sort_order,
    majorCategory: p.major_category,
    majorId: p.major_id,
    minorCategory: p.minor_category,
    minorId: p.minor_id,
  }))
  res.json({ code: 0, data: list })
})

// 获取单个站点配置（公共只读）
router.get('/site-config/:key', (req, res) => {
  const row = db.prepare('SELECT value FROM site_config WHERE key = ?').get(req.params.key)
  res.json({ code: 0, data: row ? row.value : '' })
})

export default router
