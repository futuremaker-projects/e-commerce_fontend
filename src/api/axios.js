import axios from 'axios'
import { useAuthStore } from '@/store/auth'

// 사용자 서버 (포트 8080)
const USER_API_BASE_URL = import.meta.env.VITE_USER_API_BASE_URL || 'http://localhost:8080/api'
// 제품 서버 (포트 8081)
const PRODUCT_API_BASE_URL = import.meta.env.VITE_PRODUCT_API_BASE_URL || 'http://localhost:8081/api'

// 공통 인터셉터 설정 함수
const setupInterceptors = (client) => {
  // Request 인터셉터: JWT 토큰 자동 추가
  client.interceptors.request.use(
    (config) => {
      const authStore = useAuthStore()
      if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response 인터셉터: 토큰 만료 처리
  client.interceptors.response.use(
    (response) => {
      return response
    },
    async (error) => {
      const authStore = useAuthStore()
      
      if (error.response?.status === 401) {
        // 토큰 만료 또는 인증 실패
        authStore.logoutUser()
      }
      
      return Promise.reject(error)
    }
  )
}

// 사용자 서버용 axios 인스턴스
export const authApiClient = axios.create({
  baseURL: USER_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 제품 서버용 axios 인스턴스
export const productApiClient = axios.create({
  baseURL: PRODUCT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 각 인스턴스에 인터셉터 설정
setupInterceptors(authApiClient)
setupInterceptors(productApiClient)

// 기본 export는 사용자 서버용 (하위 호환성)
export default authApiClient

