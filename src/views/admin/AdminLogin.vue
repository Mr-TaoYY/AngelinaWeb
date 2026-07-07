<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminLogin } from '../../api/auth.js'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await adminLogin({
      username: username.value,
      password: password.value,
    })
    if (res.code === 0) {
      localStorage.setItem('admin_token', res.data.token)
      localStorage.setItem('admin_username', res.data.username)
      router.push('/admin/swiper')
    } else {
      error.value = res.message || '登录失败'
    }
  } catch (e) {
    error.value = e.response?.data?.message || '登录失败，请检查账号密码'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="admin-login-page">
    <div class="login-box">
      <h1>安捷莉娜管理后台</h1>
      <p class="login-subtitle">内容管理系统</p>
      <div class="form-group">
        <label>用户名</label>
        <input v-model="username" type="text" placeholder="请输入用户名" @keyup.enter="handleLogin" />
      </div>
      <div class="form-group">
        <label>密码</label>
        <input v-model="password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
      </div>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <button class="login-btn" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登 录' }}
      </button>
      <p class="login-tip">默认账号：admin / admin123</p>
    </div>
  </div>
</template>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}
.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.login-box h1 {
  font-size: 22px;
  text-align: center;
  color: #1a1a2e;
  margin: 0 0 6px;
  font-weight: 600;
}
.login-subtitle {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin: 0 0 30px;
}
.form-group {
  margin-bottom: 18px;
}
.form-group label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}
.form-group input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.form-group input:focus {
  outline: none;
  border-color: #c9a96e;
}
.error-msg {
  color: #e74c3c;
  font-size: 13px;
  margin: 0 0 14px;
}
.login-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #c9a96e 0%, #b8945f 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}
.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}
.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.login-tip {
  text-align: center;
  font-size: 12px;
  color: #aaa;
  margin-top: 16px;
}
</style>
