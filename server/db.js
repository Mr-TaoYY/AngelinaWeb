import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from './config.js'

const db = new Database(config.dbPath)
db.pragma('journal_mode = WAL')

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  const swiperCols = db
    .prepare("PRAGMA table_info('swiper')")
    .all()
    .map((c) => c.name)
  if (swiperCols.includes('title') || swiperCols.includes('subtitle')) {
    db.exec('DROP TABLE IF EXISTS swiper')
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS swiper (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_pc TEXT,
      image_tablet TEXT,
      image_mobile TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store TEXT,
      title TEXT,
      type TEXT DEFAULT 'href',
      url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS help_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      type TEXT DEFAULT 'category',
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS help_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS brand_story (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT DEFAULT 'image',
      image_pc TEXT,
      image_tablet TEXT,
      image_mobile TEXT,
      video_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT DEFAULT 'major',
      parent_id INTEGER,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT NOT NULL,
      license TEXT,
      spec TEXT,
      price REAL DEFAULT 0,
      image TEXT,
      link_url TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)
  // 种子：产品通用跳转链接
  db.prepare(
    "INSERT OR IGNORE INTO site_config (key, value) VALUES ('product_default_link_url', '')"
  ).run()
  // 迁移：给 brand_story 增加 video_url 字段（已有表没有这个字段）
  try {
    const cols = db.prepare("PRAGMA table_info('brand_story')").all().map(c => c.name)
    if (!cols.includes('video_url')) {
      db.exec('ALTER TABLE brand_story ADD COLUMN video_url TEXT DEFAULT ""')
      console.log('[DB] brand_story 表已新增 video_url 字段')
    }
  } catch (e) {
    // 忽略错误（新表不存在时忽略）
  }
  // 迁移：给 product 增加 link_url 字段
  try {
    const cols = db.prepare("PRAGMA table_info('product')").all().map(c => c.name)
    if (!cols.includes('link_url')) {
      db.exec("ALTER TABLE product ADD COLUMN link_url TEXT DEFAULT ''")
      console.log('[DB] product 表已新增 link_url 字段')
    }
  } catch (e) {
    // 忽略错误
  }
}

function seedDefaultAdmin() {
  const row = db.prepare('SELECT COUNT(*) as count FROM admin').get()
  if (row.count === 0) {
    const hash = bcrypt.hashSync(config.defaultAdmin.password, 10)
    db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)').run(
      config.defaultAdmin.username,
      hash
    )
    console.log(`[DB] 默认管理员已创建: ${config.defaultAdmin.username} / ${config.defaultAdmin.password}`)
  }
}

const defaultSwiper = [
  {},
  {},
  {},
  {},
  {},
  {},
]

function seedSwiper() {
  const row = db.prepare('SELECT COUNT(*) as count FROM swiper').get()
  if (row.count > 0) return
  const stmt = db.prepare(`
    INSERT INTO swiper (image_pc, image_tablet, image_mobile, sort_order)
    VALUES (?, ?, ?, ?)
  `)
  const insertMany = db.transaction((items) => {
    items.forEach((item, idx) => {
      stmt.run('', '', '', idx)
    })
  })
  insertMany(defaultSwiper)
  console.log(`[DB] 已导入 ${defaultSwiper.length} 条轮播图数据`)
}

const defaultChannels = [
  { store: '【京东】', title: '安捷莉娜旗舰店', type: 'href', url: 'https://mall.jd.com/index-10322988.html' },
  { store: '【抖音】', title: '安捷莉娜官方旗舰店', type: 'href', url: 'https://www.douyin.com/user/MS4wLjABAAAAQw03bK77F32NpZV4bcUN0PzeaiDsCLX37Qc-Y87G8s6nleA39w1mk5QEA6mAPTX5?from_tab_name=main' },
  { store: '【天猫】', title: '安捷莉娜旗舰店', type: 'href', url: 'https://anjielina.tmall.com/shop/view_shop.htm?spm=a21n57.shop_search.0.0.7fb9523cCY63Z3' },
]

function seedChannels() {
  const row = db.prepare('SELECT COUNT(*) as count FROM channels').get()
  if (row.count > 0) return
  const stmt = db.prepare(`
    INSERT INTO channels (store, title, type, url, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `)
  const insertMany = db.transaction((items) => {
    items.forEach((item, idx) => {
      stmt.run(item.store, item.title, item.type, item.url, idx)
    })
  })
  insertMany(defaultChannels)
  console.log(`[DB] 已导入 ${defaultChannels.length} 条渠道数据`)
}

const defaultHelp = [
  {
    title: '常见问题',
    type: 'category',
    children: [
      {
        name: '联系我们',
        description: [
          '品牌热线：400-660-9529（周一至周五9:00-17:30）',
          '咨询热线：400-660-9529（周一至周五9:00-17:30）',
        ],
      },
      {
        name: '怎样获得关于产品的建议？',
        description: [
          '您可以将您的问题通过以下官方渠道在线咨询：',
          '天猫搜索：安捷莉娜官方旗舰店',
          '京东搜索：安捷莉娜官方旗舰店',
          '抖音搜索：安捷莉娜官方旗舰店',
          '微信搜索小程序：安捷莉娜ANGELINA',
          '或致电客服400-660-9529（周一至周五9:00-17:30）。',
        ],
      },
      {
        name: '对已经收到购买产品有疑问，可以在哪里咨询？',
        description: ['您可以联系购买渠道的相关客服咨询。'],
      },
      {
        name: '品牌会员如何咨询会员信息？',
        description: [
          '您可以通过微信搜索"安捷莉娜ANGELINA"小程序，进入会员中心进行查询，如您还有任何疑问，可致电品牌热线：400-660-9529（周一至周五9:00-17:30）。',
        ],
      },
      {
        name: '官网展示的产品为什么在其它渠道有差异/缺货/无货？',
        description: ['官网仅做产品展示，具体您可以咨询销售渠道的相关客服。'],
      },
    ],
  },
  { title: '使用条款', type: 'content', description: '/' },
  { title: '隐私声明', type: 'content', description: '/' },
  { title: 'Cookies政策', type: 'content', description: '/' },
  { title: '知识产权和版权', type: 'content', description: '/' },
  { title: '本地法律和规定', type: 'content', description: '/' },
  { title: '责任限度', type: 'content', description: '/' },
  { title: '安全性', type: 'content', description: '/' },
  { title: '不确定性', type: 'content', description: '/' },
  { title: '个人信息使用', type: 'content', description: '/' },
]

function seedHelp() {
  const row = db.prepare('SELECT COUNT(*) as count FROM help_categories').get()
  if (row.count > 0) return
  const catStmt = db.prepare(`
    INSERT INTO help_categories (title, type, description, sort_order)
    VALUES (?, ?, ?, ?)
  `)
  const itemStmt = db.prepare(`
    INSERT INTO help_items (category_id, name, description, sort_order)
    VALUES (?, ?, ?, ?)
  `)
  const insertAll = db.transaction((categories) => {
    categories.forEach((cat, catIdx) => {
      const catInfo = catStmt.run(cat.title, cat.type, cat.description || null, catIdx)
      const categoryId = catInfo.lastInsertRowid
      if (cat.type === 'category' && cat.children && cat.children.length) {
        cat.children.forEach((item, itemIdx) => {
          itemStmt.run(categoryId, item.name, JSON.stringify(item.description || []), itemIdx)
        })
      }
    })
  })
  insertAll(defaultHelp)
  console.log(`[DB] 已导入 ${defaultHelp.length} 条帮助中心分类`)
}

const defaultBrandStory = [
  { type: 'image', video_url: '' },
  { type: 'video', video_url: '' },
  { type: 'image', video_url: '' },
  { type: 'image', video_url: '' },
  { type: 'image', video_url: '' },
]

function seedBrandStory() {
  const row = db.prepare('SELECT COUNT(*) as count FROM brand_story').get()
  if (row.count > 0) return
  const stmt = db.prepare(`
    INSERT INTO brand_story (type, image_pc, image_tablet, image_mobile, video_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const insertMany = db.transaction((items) => {
    items.forEach((item, idx) => {
      stmt.run(item.type, '', '', '', item.video_url || '', idx)
    })
  })
  insertMany(defaultBrandStory)
  console.log(`[DB] 已导入 ${defaultBrandStory.length} 条品牌故事数据`)
}

function seedProducts() {
  const catCount = db.prepare('SELECT COUNT(*) as count FROM product_category').get().count
  if (catCount > 0) return

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const jsonPath = path.join(__dirname, '..', 'src', 'data', 'productData.json')
  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  // 构建分类映射
  const majorMap = {}  // '脸部护理' -> categoryId
  const minorMap = {}  // '脸部护理|清洁/卸妆' -> categoryId

  // 大分类
  const majorNames = [...new Set(products.map(p => p.majorCategory))]
  const catStmt = db.prepare(`INSERT INTO product_category (name, type, parent_id, sort_order) VALUES (?, ?, ?, ?)`)
  majorNames.forEach((name, idx) => {
    const info = catStmt.run(name, 'major', null, idx)
    majorMap[name] = info.lastInsertRowid
  })

  // 小分类
  const minorNames = {}  // major -> [minor, ...]
  products.forEach(p => {
    if (!minorNames[p.majorCategory]) minorNames[p.majorCategory] = []
    if (!minorNames[p.majorCategory].includes(p.minorCategory)) {
      minorNames[p.majorCategory].push(p.minorCategory)
    }
  })
  Object.keys(minorNames).forEach(major => {
    minorNames[major].forEach((minor, idx) => {
      const info = catStmt.run(minor, 'minor', majorMap[major], idx)
      minorMap[`${major}|${minor}`] = info.lastInsertRowid
    })
  })

  // 产品
  const prodStmt = db.prepare(`INSERT INTO product (category_id, name, license, spec, price, image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`)
  const insertProducts = db.transaction((items) => {
    let order = 0
    items.forEach(p => {
      const catId = minorMap[`${p.majorCategory}|${p.minorCategory}`]
      prodStmt.run(catId, p.name, p.license || '', p.spec || '', p.price || 0, '', order++)
    })
  })
  insertProducts(products)
  console.log(`[DB] 已导入 ${products.length} 条产品数据，${majorNames.length} 个大分类`)
}

export function initDb() {
  initTables()
  seedDefaultAdmin()
  seedSwiper()
  seedChannels()
  seedHelp()
  seedBrandStory()
  seedProducts()
  console.log('[DB] 数据库初始化完成')
}

export default db
