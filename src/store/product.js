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

  // 상품명에서 주요 키워드 추출 및 영어 매핑
  function getImageKeyword(productName) {
    if (!productName) return 1
    
    // 키워드 매핑 (한국어 -> 이미지 ID 범위)
    const keywordMap = {
      '키보드': { min: 1, max: 50 },
      '모니터': { min: 51, max: 100 },
      '마우스': { min: 101, max: 150 },
      '노트북': { min: 151, max: 200 },
      '스마트폰': { min: 201, max: 250 },
      '청소기': { min: 251, max: 300 },
      '전동칫솔': { min: 301, max: 350 },
      '무선이어폰': { min: 351, max: 400 },
      '후드티': { min: 401, max: 450 },
      '운동화': { min: 451, max: 500 }
    }
    
    // 제품 키워드 찾기
    for (const [keyword, range] of Object.entries(keywordMap)) {
      if (productName.includes(keyword)) {
        // 상품 ID를 기반으로 범위 내에서 고유한 이미지 ID 생성
        const productId = productName.charCodeAt(0) + (productName.length * 7)
        return range.min + (productId % (range.max - range.min + 1))
      }
    }
    
    // 키워드가 없으면 상품명의 해시값을 사용하여 이미지 ID 생성
    let hash = 0
    for (let i = 0; i < productName.length; i++) {
      hash = ((hash << 5) - hash) + productName.charCodeAt(i)
      hash = hash & hash // 32bit 정수로 변환
    }
    return Math.abs(hash % 1000) + 1
  }

  // API 응답의 상품 데이터를 프론트엔드 형식으로 변환
  function mapProductData(apiProduct) {
    // 이미지 URL이 없으면 상품명 기반으로 관련 이미지 생성
    let imageUrl = apiProduct.imageUrl
    if (!imageUrl) {
      const imageId = apiProduct.productName 
        ? getImageKeyword(apiProduct.productName) 
        : (apiProduct.productId || Math.floor(Math.random() * 1000) + 1)
      // Lorem Picsum을 사용하여 안정적인 이미지 제공
      imageUrl = `https://picsum.photos/seed/${imageId}/400/400`
    }
    
    return {
      id: apiProduct.productId,
      name: apiProduct.productName,
      description: apiProduct.Description || apiProduct.description || '',
      price: apiProduct.price || 0,
      stock: apiProduct.quantity || apiProduct.stock || 0,
      imageUrl: imageUrl,
      categoryId: apiProduct.categoryId || null
    }
  }

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
      const responseData = response.data?.data || response.data
      const content = responseData?.content || []
      
      // API 응답 형식을 프론트엔드 형식으로 변환
      const newProducts = content.map(mapProductData)

      if (pageNum === 0) {
        products.value = [...newProducts]
      } else {
        products.value = [...products.value, ...newProducts]
      }
      
      // Spring Slice의 last 속성을 사용하여 더 불러올 데이터가 있는지 확인
      hasMore.value = !responseData?.last
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
      const responseData = response.data?.data || response.data
      const content = responseData?.content || []
      
      // API 응답 형식을 프론트엔드 형식으로 변환
      const newProducts = content.map(mapProductData)
      
      if (pageNum === 0) {
        products.value = [...newProducts]
      } else {
        products.value = [...products.value, ...newProducts]
      }
      
      // Spring Slice의 last 속성을 사용하여 더 불러올 데이터가 있는지 확인
      hasMore.value = !responseData?.last
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
      const responseData = response.data?.data || response.data
      const content = responseData?.content || []
      
      // API 응답 형식을 프론트엔드 형식으로 변환
      const newProducts = content.map(mapProductData)
      
      if (pageNum === 0) {
        products.value = [...newProducts]
      } else {
        products.value = [...products.value, ...newProducts]
      }
      
      // Spring Slice의 last 속성을 사용하여 더 불러올 데이터가 있는지 확인
      hasMore.value = !responseData?.last
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


