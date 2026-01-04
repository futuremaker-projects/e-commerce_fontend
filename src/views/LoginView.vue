<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">B2B 이커머스</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">사용자명</label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            required
            placeholder="사용자명을 입력하세요"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            placeholder="비밀번호를 입력하세요"
            class="form-input"
          />
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <button type="submit" :disabled="loading" class="login-button">
          {{ loading ? '로그인 중...' : '로그인' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const credentials = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await authStore.loginUser(credentials.value)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || '로그인에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped src="./css/LoginView.css"></style>

