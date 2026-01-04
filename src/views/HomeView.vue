<template>
  <div class="home-container">
    <div class="header-wrapper" @mouseleave="hoveredCategoryId = null">
      <header class="header">
        <div class="header-content">
          <h1 class="logo" @click="goHome">B2B 이커머스</h1>
          <nav class="category-nav">
            <div
              v-for="category in categories"
              :key="category.id"
              class="category-nav-item"
              :data-category-id="category.id"
              @mouseenter="hoveredCategoryId = category.id"
            >
              <button
                class="category-nav-button"
                :class="{ active: selectedCategoryId === category.id || isSubCategorySelected(category.id) }"
                @click="selectMainCategory(category.id)"
              >
                {{ category.name }}
              </button>
            </div>
          </nav>
          <button class="category-menu-button" @click="isDrawerOpen = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            카테고리
          </button>
          <div class="header-actions">
            <template v-if="authStore.isAuthenticated">
              <span class="user-info">{{ authStore.user?.username || '사용자' }}</span>
              <button @click="handleLogout" class="logout-button">로그아웃</button>
            </template>
            <template v-else>
              <button @click="handleLogin" class="login-button">로그인</button>
            </template>
          </div>
        </div>
      </header>
      <div 
        class="sub-categories-bar"
        v-show="hoveredCategoryId"
      >
        <div class="sub-categories-content">
          <div
            v-for="category in categories"
            :key="category.id"
            class="sub-category-group"
            :data-category-id="category.id"
          >
            <div 
              class="sub-category-group-title"
              :class="{ active: selectedCategoryId === category.id }"
              @click="selectMainCategoryFromDropdown(category.id)"
            >
              {{ category.name }}
            </div>
            <div class="sub-category-items">
              <div
                v-for="subCategory in category.subCategories"
                :key="subCategory.id"
                class="sub-category-item"
                :class="{ active: selectedCategoryId === subCategory.id }"
                @click="selectCategory(subCategory.id)"
              >
                {{ subCategory.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Drawer Overlay -->
    <div 
      class="drawer-overlay" 
      :class="{ active: isDrawerOpen }"
      @click="isDrawerOpen = false"
    ></div>

    <!-- Category Drawer -->
    <div class="category-drawer" :class="{ open: isDrawerOpen }">
      <div class="drawer-header">
        <h2>카테고리</h2>
        <button class="drawer-close-button" @click="isDrawerOpen = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="drawer-content">
        <div
          v-for="category in categories"
          :key="category.id"
          class="drawer-category-item"
        >
          <button
            class="drawer-category-button"
            :class="{ 
              active: selectedCategoryId === category.id || isSubCategorySelected(category.id),
              expanded: expandedCategoryId === category.id
            }"
            @click="toggleCategory(category.id)"
          >
            <span>{{ category.name }}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              class="expand-icon"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div 
            class="drawer-subcategories"
            :class="{ expanded: expandedCategoryId === category.id }"
          >
            <div
              v-for="subCategory in category.subCategories"
              :key="subCategory.id"
              class="drawer-subcategory-item"
              :class="{ active: selectedCategoryId === subCategory.id }"
              @click="selectCategoryFromDrawer(subCategory.id)"
            >
              {{ subCategory.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <main class="main-content">
      <div class="search-section">
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="상품을 검색하세요..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button @click="handleSearch" class="search-button">검색</button>
        </div>
        <div v-if="selectedCategoryId" class="selected-category-info">
          <span class="category-badge">
            {{ getCategoryName(selectedCategoryId) }}
            <button @click="clearCategory" class="btn-close-category">✕</button>
          </span>
        </div>
      </div>

      <div class="products-section">
        <div v-if="productStore.loading" class="loading">
          상품을 불러오는 중...
        </div>
        <div v-else-if="productStore.error" class="error">
          {{ productStore.error }}
        </div>
        <div v-else-if="productStore.products.length === 0" class="empty">
          검색 결과가 없습니다.
        </div>
        <div v-else class="products-section-content">
          <div class="products-grid">
            <div
              v-for="product in productStore.products"
              :key="product.id"
              class="product-card"
              @click="goToProductDetail(product.id)"
            >
            <div class="product-image">
              <img
                :src="product.imageUrl || '/placeholder-image.png'"
                :alt="product.name"
                @error="handleImageError"
              />
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-footer">
                <span class="product-price">{{ formatPrice(product.price) }}원</span>
                <span class="product-stock">재고: {{ product.stock || 0 }}</span>
              </div>
            </div>
          </div>
          <div v-if="productStore.isLoadingMore" class="loading-more">
            더 많은 상품을 불러오는 중...
          </div>
          <div v-else-if="!productStore.hasMore && productStore.products.length > 0" class="no-more">
            모든 상품을 불러왔습니다.
          </div>
        </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useProductStore } from '@/store/product'
import { categories } from '@/utils/categories'

const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()

const searchQuery = ref('')
const selectedCategoryId = ref(null)
const hoveredCategoryId = ref(null)
const isDrawerOpen = ref(false)
const expandedCategoryId = ref(null)

// 무한 스크롤 핸들러
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  
  // 스크롤이 하단 200px 이내에 도달하면 다음 페이지 로드
  if (scrollTop + windowHeight >= documentHeight - 200) {
    if (productStore.hasMore && !productStore.isLoadingMore && !productStore.loading) {
      productStore.loadMore()
    }
  }
}

const handleSearch = async () => {
  selectedCategoryId.value = null
  productStore.selectedCategoryId = null
  productStore.resetSearch()
  if (searchQuery.value.trim()) {
    await productStore.search(searchQuery.value.trim(), { pageNum: 0 })
  } else {
    await productStore.fetchProducts({ pageNum: 0 })
  }
}

const selectMainCategory = (categoryId) => {
  // 1뎁스 카테고리 클릭 시 해당 카테고리의 모든 상품 표시
  selectedCategoryId.value = categoryId
  productStore.selectedCategoryId = categoryId
  productStore.resetSearch()
  productStore.filterByCategory(categoryId, 0)
  hoveredCategoryId.value = null // 하위 카테고리 드롭다운 닫기
}

const selectMainCategoryFromDropdown = (categoryId) => {
  // 드롭다운에서 최상위 카테고리 선택 시
  selectMainCategory(categoryId)
}

const selectCategory = (categoryId) => {
  selectedCategoryId.value = categoryId
  productStore.selectedCategoryId = categoryId
  productStore.resetSearch()
  productStore.filterByCategory(categoryId, 0)
  hoveredCategoryId.value = null // 하위 카테고리 드롭다운 닫기
}

const toggleCategory = (categoryId) => {
  if (expandedCategoryId.value === categoryId) {
    expandedCategoryId.value = null
  } else {
    expandedCategoryId.value = categoryId
  }
}

const selectCategoryFromDrawer = (categoryId) => {
  selectCategory(categoryId)
  isDrawerOpen.value = false
  expandedCategoryId.value = null
}

const clearCategory = () => {
  selectedCategoryId.value = null
  productStore.selectedCategoryId = null
  productStore.resetSearch()
  productStore.fetchProducts({ pageNum: 0 })
}

const goHome = () => {
  router.push('/')
}

const getCategoryName = (categoryId) => {
  for (const category of categories) {
    if (category.id === categoryId) {
      return category.name
    }
    const subCategory = category.subCategories.find(sub => sub.id === categoryId)
    if (subCategory) {
      return `${category.name} > ${subCategory.name}`
    }
  }
  return ''
}

const isSubCategorySelected = (categoryId) => {
  const category = categories.find(cat => cat.id === categoryId)
  if (category) {
    return category.subCategories.some(sub => sub.id === selectedCategoryId.value)
  }
  return false
}

const handleLogout = async () => {
  await authStore.logoutUser()
}

const handleLogin = () => {
  router.push('/login')
}

const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

const formatPrice = (price) => {
  if (!price) return '0'
  return new Intl.NumberFormat('ko-KR').format(price)
}

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
}

onMounted(async () => {
  // 초기 상품 목록 로드
  productStore.resetSearch()
  await productStore.fetchProducts({ pageNum: 0 })
  
  // 스크롤 이벤트 리스너 추가
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 스크롤 이벤트 리스너 제거
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped src="./css/HomeView.css"></style>

