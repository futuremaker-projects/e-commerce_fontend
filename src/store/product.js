import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getProducts, searchProducts, getProductsByCategory } from '@/api/product'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const selectedCategoryId = ref(null)

  const currentPageNum = ref(0) // 현재 페이지 번호 (pageNum)
  const hasMore = ref(true) // 더 불러올 데이터가 있는지
  const isLoadingMore = ref(false) // 추가 로딩 중인지

  // 카테고리별 필터링 (API 호출)
  async function filterByCategory(categoryId, pageNum = 0) {
    // 첫 페이지 로드 시에만 loading 표시
    if (pageNum === 0) {
      loading.value = true
    } else {
      isLoadingMore.value = true
    }
    error.value = null
    
    try {
      const response = await getProductsByCategory(categoryId, pageNum)
      const newProducts = response.data || []
      
      if (pageNum === 0) {
        products.value = [...newProducts]
      } else {
        products.value = [...products.value, ...newProducts]
      }
      
      // 응답이 비어있거나 길이가 0이면 더 이상 데이터가 없음
      hasMore.value = newProducts.length > 0
      currentPageNum.value = pageNum
    } catch (err) {
      error.value = err.response?.data?.message || err.message || '카테고리별 상품을 불러오는데 실패했습니다.'
      if (pageNum === 0) {
        products.value = []
      }
      throw err
    } finally {
      loading.value = false
      isLoadingMore.value = false
    }
  }

  async function fetchProducts(params = {}) {
    const pageNum = params.pageNum !== undefined ? params.pageNum : (params.page || 0)
    
    // 첫 페이지 로드 시에만 loading 표시
    if (pageNum === 0) {
      loading.value = true
    } else {
      isLoadingMore.value = true
    }
    error.value = null

    try {
      const response = await getProducts({ pageNum, ...params })
      const newProducts = response.data || []
      
      if (pageNum === 0) {
        products.value = [...newProducts]
      } else {
        products.value = [...products.value, ...newProducts]
      }
      
      // 응답이 비어있거나 길이가 0이면 더 이상 데이터가 없음
      hasMore.value = newProducts.length > 0
      currentPageNum.value = pageNum
      return response
    } catch (err) {
      error.value = err.response?.data?.message || err.message || '상품을 불러오는데 실패했습니다.'
      if (pageNum === 0) {
        products.value = []
      }
      throw err
    } finally {
      loading.value = false
      isLoadingMore.value = false
    }
  }

  async function search(query, params = {}) {
    const pageNum = params.pageNum !== undefined ? params.pageNum : (params.page || 0)
    
    // 첫 페이지 로드 시에만 loading 표시
    if (pageNum === 0) {
      loading.value = true
    } else {
      isLoadingMore.value = true
    }
    error.value = null
    searchQuery.value = query

    try {
      const response = await searchProducts(query, pageNum)
      const newProducts = response.data || []
      
      if (pageNum === 0) {
        products.value = [...newProducts]
      } else {
        products.value = [...products.value, ...newProducts]
      }
      
      // 응답이 비어있거나 길이가 0이면 더 이상 데이터가 없음
      hasMore.value = newProducts.length > 0
      currentPageNum.value = pageNum
      return response
    } catch (err) {
      error.value = err.response?.data?.message || err.message || '검색에 실패했습니다.'
      if (pageNum === 0) {
        products.value = []
      }
      throw err
    } finally {
      loading.value = false
      isLoadingMore.value = false
    }
  }
  
  // 다음 페이지 로드 (무한 스크롤)
  async function loadMore() {
    if (isLoadingMore.value || !hasMore.value || loading.value) return
    
    const nextPageNum = currentPageNum.value + 1
    
    if (searchQuery.value) {
      await search(searchQuery.value, { pageNum: nextPageNum })
    } else if (selectedCategoryId.value) {
      await filterByCategory(selectedCategoryId.value, nextPageNum)
    } else {
      await fetchProducts({ pageNum: nextPageNum })
    }
  }
  
  // 필터/검색 초기화
  function resetSearch() {
    currentPageNum.value = 0
    hasMore.value = true
    searchQuery.value = ''
    selectedCategoryId.value = null
  }

  function clearSearch() {
    resetSearch()
    products.value = []
  }

  return {
    products,
    loading,
    error,
    searchQuery,
    currentPageNum,
    hasMore,
    isLoadingMore,
    selectedCategoryId,
    fetchProducts,
    search,
    clearSearch,
    filterByCategory,
    loadMore,
    resetSearch
  }
})


