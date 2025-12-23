import apiClient from './axios'

export const login = (credentials) => {
  return apiClient.post('/auth/login', credentials)
}

export const logout = () => {
  return apiClient.post('/auth/logout')
}

export const getCurrentUser = () => {
  return apiClient.get('/auth/me')
}

