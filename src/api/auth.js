import { authApiClient } from './axios'

export const login = (credentials) => {
  return authApiClient.post('/auth/login', credentials)
}

export const logout = () => {
  return authApiClient.post('/auth/logout')
}

export const getCurrentUser = () => {
  return authApiClient.get('/auth/me')
}

