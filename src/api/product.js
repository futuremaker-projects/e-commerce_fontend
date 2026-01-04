import { productApiClient } from './axios'

export const getProducts = (params = {}) => {
  return productApiClient.get('/products', { params })
}

export const getProduct = (id) => {
  return productApiClient.get(`/products/${id}`)
}

export const searchProducts = (query, params = {}) => {
  return productApiClient.get('/products/search', {
    params: {
      q: query,
      ...params
    }
  })
}

