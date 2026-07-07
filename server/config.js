import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const config = {
  port: 3000,
  jwtSecret: 'angelina-admin-secret-key-2024',
  jwtExpiresIn: '7d',
  uploadDir: path.join(__dirname, 'uploads'),
  dbPath: path.join(__dirname, 'data.db'),
  defaultAdmin: {
    username: 'admin',
    password: 'admin123',
  },
}
