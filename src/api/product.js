import { productApiClient } from './axios'

export const getProducts = (params = {}) => {
  return productApiClient.get('/products', { params })
}

export const getProduct = (id) => {
  return productApiClient.get(`/products/${id}`)
}

export const searchProducts = (query, pageNum = 0) => {
  return productApiClient.get('/products', {
    params: {
      productName: query,
      pageNum: pageNum
    }
  })
}

export const getProductsByCategory = (categoryId, pageNum = 0) => {
  return productApiClient.get(`/products/categories/${categoryId}`, {
    params: {
      pageNum: pageNum
    }
  })
}