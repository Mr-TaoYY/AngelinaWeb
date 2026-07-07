import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'
import { config } from '../config.js'

const router = Router()

router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '请输入用户名和密码' })
  }
  const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username)
  if (!admin) {
    return res.status(401).json({ code: 401, message: '用户名或密码错误' })
  }
  const valid = bcrypt.compareSync(password, admin.password_hash)
  if (!valid) {
    return res.status(401).json({ code: 401, message: '用户名或密码错误' })
  }
  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )
  res.json({
    code: 0,
    data: { token, username: admin.username },
    message: '登录成功',
  })
})

export default router
