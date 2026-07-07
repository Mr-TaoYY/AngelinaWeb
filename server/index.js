import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { config } from './config.js'
import { initDb } from './db.js'

import publicRoutes from './routes/public.js'
import authRoutes from './routes/auth.js'
import swiperRoutes from './routes/swiper.js'
import channelsRoutes from './routes/channels.js'
import helpRoutes from './routes/help.js'
import brandStoryRoutes from './routes/brandStory.js'
import productsRoutes from './routes/products.js'
import uploadRoutes from './routes/upload.js'
import settingsRoutes from './routes/settings.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(config.uploadDir))

const distPath = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
}

app.use('/api', publicRoutes)
app.use('/api/admin', authRoutes)
app.use('/api/admin/swiper', swiperRoutes)
app.use('/api/admin/channels', channelsRoutes)
app.use('/api/admin/help', helpRoutes)
app.use('/api/admin/brand-story', brandStoryRoutes)
app.use('/api/admin/products', productsRoutes)
app.use('/api/admin/upload', uploadRoutes)
app.use('/api/admin/settings', settingsRoutes)

if (fs.existsSync(distPath)) {
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message)
  res.status(500).json({ code: 500, message: err.message || '服务器错误' })
})

initDb()

app.listen(config.port, () => {
  console.log(`\n  服务已启动`)
  console.log(`  ➜  API: http://localhost:${config.port}/api`)
  console.log(`  ➜  管理后台: /admin`)
  console.log(`  ➜  默认账号: admin / admin123\n`)
})
