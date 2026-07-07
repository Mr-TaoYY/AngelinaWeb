import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { config } from '../config.js'
import { authMiddleware } from '../middleware/auth.js'
import db from '../db.js'

const router = Router()

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|gif|webp/
    const videoTypes = /mp4|webm|mov|ogg/
    const ext = path.extname(file.originalname).toLowerCase().slice(1)
    const isImage = imageTypes.test(ext) && imageTypes.test(file.mimetype)
    const isVideo = videoTypes.test(ext) && videoTypes.test(file.mimetype)
    if (isImage || isVideo) return cb(null, true)
    cb(new Error('仅支持图片或视频格式'))
  },
})

router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, message: '未上传文件' })
  }
  const url = `/uploads/${req.file.filename}`
  res.json({ code: 0, data: { url, filename: req.file.filename } })
})

// 提取文件名（去除 /uploads/ 前缀）
function extractFilename(url) {
  if (!url) return ''
  if (typeof url !== 'string') return ''
  if (url.startsWith('/uploads/')) return url.slice('/uploads/'.length)
  return url
}

// 收集数据库中所有被引用的上传文件名
function getReferencedFiles() {
  const files = new Set()
  // swiper
  db.prepare('SELECT image_pc, image_tablet, image_mobile FROM swiper').all().forEach((r) => {
    ;[r.image_pc, r.image_tablet, r.image_mobile].forEach((v) => {
      const f = extractFilename(v)
      if (f) files.add(f)
    })
  })
  // brand_story
  db.prepare('SELECT image_pc, image_tablet, image_mobile, video_url FROM brand_story').all().forEach((r) => {
    ;[r.image_pc, r.image_tablet, r.image_mobile, r.video_url].forEach((v) => {
      const f = extractFilename(v)
      if (f) files.add(f)
    })
  })
  // product
  db.prepare('SELECT image FROM product').all().forEach((r) => {
    const f = extractFilename(r.image)
    if (f) files.add(f)
  })
  return files
}

// 扫描孤儿文件
router.get('/orphans', authMiddleware, (req, res) => {
  try {
    const referenced = getReferencedFiles()
    const allFiles = fs.readdirSync(config.uploadDir).filter((f) => fs.statSync(path.join(config.uploadDir, f)).isFile())
    const orphans = allFiles
      .filter((f) => !referenced.has(f))
      .map((f) => {
        const stat = fs.statSync(path.join(config.uploadDir, f))
        return {
          filename: f,
          size: stat.size,
          mtime: stat.mtime,
        }
      })
    const totalSize = orphans.reduce((sum, f) => sum + f.size, 0)
    res.json({ code: 0, data: { list: orphans, totalSize, count: orphans.length } })
  } catch (e) {
    res.status(500).json({ code: 500, message: e.message })
  }
})

// 清理孤儿文件（支持指定文件名或全部）
router.delete('/orphans', authMiddleware, (req, res) => {
  try {
    const referenced = getReferencedFiles()
    const allFiles = fs.readdirSync(config.uploadDir).filter((f) => fs.statSync(path.join(config.uploadDir, f)).isFile())
    const orphanFiles = allFiles.filter((f) => !referenced.has(f))
    // 可选：只删除指定的文件
    const target = Array.isArray(req.body?.filenames) ? req.body.filenames : null
    const toDelete = target ? orphanFiles.filter((f) => target.includes(f)) : orphanFiles
    let deleted = 0
    let freedBytes = 0
    toDelete.forEach((f) => {
      const fp = path.join(config.uploadDir, f)
      const stat = fs.statSync(fp)
      fs.unlinkSync(fp)
      deleted++
      freedBytes += stat.size
    })
    res.json({ code: 0, data: { deleted, freedBytes, remaining: orphanFiles.length - deleted } })
  } catch (e) {
    res.status(500).json({ code: 500, message: e.message })
  }
})

export default router
