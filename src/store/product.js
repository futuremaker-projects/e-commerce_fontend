import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getProducts, searchProducts } from '@/api/product'
import { dummyProducts } from '@/utils/dummyData'
import { categories } from '@/utils/categories'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const selectedCategoryId = ref(null)

  const useDummyData = ref(true) // 더미 데이터 사용 여부
  const currentPage = ref(0)
  const pageSize = ref(15) // 페이지당 상품 수
  const hasMore = ref(true) // 더 불러올 데이터가 있는지
  const isLoadingMore = ref(false) // 추가 로딩 중인지

  // 더미 데이터 로드 (페이지네이션)
  function loadDummyProducts(page = 0, size = 15) {
    const start = page * size
    const end = start + size
    const newProducts = dummyProducts.slice(start, end)
    
    if (page === 0) {
      products.value = [...newProducts]
    } else {
      products.value = [...products.value, ...newProducts]
    }
    
    hasMore.value = end < dummyProducts.length
    currentPage.value = page
    loading.value = false
    isLoadingMore.value = false
    error.value = null
  }

  // 더미 데이터 검색
  function searchDummyProducts(query, page = 0, size = 15) {
    const lowerQuery = query.toLowerCase()
    const filteredProducts = dummyProducts.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
    )
    
    const start = page * size
    const end = start + size
    const newProducts = filteredProducts.slice(start, end)
    
    if (page === 0) {
      products.value = [...newProducts]
    } else {
      products.value = [...products.value, ...newProducts]
    }
    
    hasMore.value = end < filteredProducts.length
    currentPage.value = page
    loading.value = false
    isLoadingMore.value = false
    error.value = null
  }

  // 카테고리별 필터링
  function filterByCategory(categoryId, page = 0, size = 15) {
    loading.value = true
    error.value = null
    currentPage.value = page
    
    setTimeout(() => {
      let filteredProducts = []
      
      if (categoryId === null || categoryId === undefined) {
        filteredProducts = [...dummyProducts]
      } else {
        // 1뎁스 카테고리인 경우, 해당 카테고리와 모든 서브카테고리 포함
        const category = categories.find(cat => cat.id === categoryId)
        if (category) {
          const subCategoryIds = category.subCategories.map(sub => sub.id)
          filteredProducts = dummyProducts.filter(product => 
            product.categoryId === categoryId || subCategoryIds.includes(product.categoryId)
          )
        } else {
          // 2뎁스 서브카테고리인 경우
          filteredProducts = dummyProducts.filter(product => product.categoryId === categoryId)
        }
      }
      
      const start = page * size
      const end = start + size
      const newProducts = filteredProducts.slice(start, end)
      
      if (page === 0) {
        products.value = [...newProducts]
      } else {
        products.value = [...products.value, ...newProducts]
      }
      
      hasMore.value = end < filteredProducts.length
      loading.value = false
      isLoadingMore.value = false
    }, 300)
  }

  async function fetchProducts(params = {}) {
    const page = params.page || 0
    const size = params.size || pageSize.value
    
    // 첫 페이지 로드 시에만 loading 표시
    if (page === 0) {
      loading.value = true
    } else {
      isLoadingMore.value = true
    }
    error.value = null
    
    // 더미 데이터 사용 시
    if (useDummyData.value) {
      setTimeout(() => {
        loadDummyProducts(page, size)
      }, 300) // 로딩 효과를 위한 딜레이
      return
    }

    // 실제 API 호출 (현재는 동작하지 않음, 더미 데이터 사용 중)
    try {
      // API 호출 코드 (더미 데이터 모드에서는 실행되지 않음)
      // const response = await getProducts({ page, size, ...params })
      // const newProducts = response.data.content || response.data || []
      // 
      // if (page === 0) {
      //   products.value = [...newProducts]
      // } else {
      //   products.value = [...products.value, ...newProducts]
      // }
      // 
      // hasMore.value = !response.data.last // Spring Boot Page 응답인 경우
      // currentPage.value = page
      // return response
      
      // 더미 데이터 모드에서는 실행되지 않음
      products.value = []
      hasMore.value = false
    } catch (err) {
      error.value = err.message || '상품을 불러오는데 실패했습니다.'
      throw err
    } finally {
      loading.value = false
      isLoadingMore.value = false
    }
  }

  async function search(query, params = {}) {
    const page = params.page || 0
    const size = params.size || pageSize.value
    
    // 첫 페이지 로드 시에만 loading 표시
    if (page === 0) {
      loading.value = true
    } else {
      isLoadingMore.value = true
    }
    error.value = null
    searchQuery.value = query

    // 더미 데이터 사용 시
    if (useDummyData.value) {
      setTimeout(() => {
        searchDummyProducts(query, page, size)
      }, 300) // 로딩 효과를 위한 딜레이
      return
    }

    // 실제 API 호출 (현재는 동작하지 않음, 더미 데이터 사용 중)
    try {
      // API 호출 코드 (더미 데이터 모드에서는 실행되지 않음)
      // const response = await searchProducts(query, { page, size, ...params })
      // const newProducts = response.data.content || response.data || []
      // 
      // if (page === 0) {
      //   products.value = [...newProducts]
      // } else {
      //   products.value = [...products.value, ...newProducts]
      // }
      // 
      // hasMore.value = !response.data.last // Spring Boot Page 응답인 경우
      // currentPage.value = page
      // return response
      
      // 더미 데이터 모드에서는 실행되지 않음
      products.value = []
      hasMore.value = false
    } catch (err) {
      error.value = err.message || '검색에 실패했습니다.'
      throw err
    } finally {
      loading.value = false
      isLoadingMore.value = false
    }
  }
  
  // 다음 페이지 로드
  async function loadMore() {
    if (isLoadingMore.value || !hasMore.value) return
    
    const nextPage = currentPage.value + 1
    
    if (searchQuery.value) {
      await search(searchQuery.value, { page: nextPage, size: pageSize.value })
    } else if (selectedCategoryId.value) {
      filterByCategory(selectedCategoryId.value, nextPage, pageSize.value)
    } else {
      await fetchProducts({ page: nextPage, size: pageSize.value })
    }
  }
  
  // 필터/검색 초기화
  function resetSearch() {
    currentPage.value = 0
    hasMore.value = true
    searchQuery.value = ''
    selectedCategoryId.value = null
  }

  function clearSearch() {
    reset()
    if (useDummyData.value) {
      loadDummyProducts(0, pageSize.value)
    } else {
      products.value = []
    }
  }

  return {
    products,
    loading,
    error,
    searchQuery,
    useDummyData,
    currentPage,
    pageSize,
    hasMore,
    isLoadingMore,
    selectedCategoryId,
    fetchProducts,
    search,
    clearSearch,
    loadDummyProducts,
    filterByCategory,
    loadMore,
    resetSearch
  }
})


