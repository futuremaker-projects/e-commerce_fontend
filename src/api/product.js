import apiClient from './axios'

export const getProducts = (params = {}) => {
  return apiClient.get('/products', { params })
}

export const getProduct = (id) => {
  return apiClient.get(`/products/${id}`)
}

export const searchProducts = (query, params = {}) => {
  return apiClient.get('/products/search', {
    params: {
      q: query,
      ...params
    }
  })
}

