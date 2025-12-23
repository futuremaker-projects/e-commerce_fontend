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
  productStore.reset()
  if (searchQuery.value.trim()) {
    await productStore.search(searchQuery.value.trim(), { page: 0, size: 15 })
  } else {
    await productStore.fetchProducts({ page: 0, size: 15 })
  }
}

const selectMainCategory = (categoryId) => {
  // 1뎁스 카테고리 클릭 시 해당 카테고리의 모든 상품 표시
  selectedCategoryId.value = categoryId
  productStore.selectedCategoryId = categoryId
  productStore.reset()
  productStore.filterByCategory(categoryId, 0, 15)
  hoveredCategoryId.value = null // 하위 카테고리 드롭다운 닫기
}

const selectMainCategoryFromDropdown = (categoryId) => {
  // 드롭다운에서 최상위 카테고리 선택 시
  selectMainCategory(categoryId)
}

const selectCategory = (categoryId) => {
  selectedCategoryId.value = categoryId
  productStore.selectedCategoryId = categoryId
  productStore.reset()
  productStore.filterByCategory(categoryId, 0, 15)
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
  productStore.reset()
  productStore.fetchProducts({ page: 0, size: 15 })
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
  // 초기 상품 목록 로드 (더미 데이터) - 첫 15개
  productStore.reset()
  await productStore.fetchProducts({ page: 0, size: 15 })
  
  // 스크롤 이벤트 리스너 추가
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 스크롤 이벤트 리스너 제거
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  overflow: visible;
}

.header-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.3s;
}

.logo:hover {
  color: #60a5fa;
}

.category-menu-button {
  display: none;
}

.category-nav {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  overflow-x: auto;
  overflow-y: visible;
  padding: 0 20px;
  justify-content: flex-start;
  position: relative;
}

.category-nav::-webkit-scrollbar {
  display: none;
}

.category-nav-item {
  position: relative;
  flex-shrink: 0;
  z-index: 100;
}

.category-nav-item:hover {
  z-index: 1000;
}

.category-nav-item:hover .sub-category-dropdown {
  display: block;
  opacity: 1;
  visibility: visible;
}

.category-nav-button {
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 64px;
  position: relative;
}

.category-nav-button:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

.category-nav-button.active {
  color: #60a5fa;
}

.category-nav-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #60a5fa;
}

.dropdown-arrow {
  font-size: 10px;
  opacity: 0.6;
  transition: transform 0.2s;
}

.header-wrapper {
  position: relative;
}

.sub-categories-bar {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(30, 41, 59, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 99;
  padding: 20px 48px;
  opacity: 1;
  visibility: visible;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
}

.sub-categories-close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
}

.sub-categories-close-button svg {
  width: 16px;
  height: 16px;
}


.sub-categories-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 30px;
}

.sub-category-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}


.sub-category-group-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.sub-category-group-title:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #60a5fa;
}

.sub-category-group-title.active {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.15);
}

.sub-category-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sub-category-item {
  padding: 8px 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  display: block;
  border-radius: 4px;
}

.sub-category-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.sub-category-item.active {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.logout-button {
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.logout-button:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.login-button {
  padding: 8px 16px;
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.login-button:hover {
  background: rgba(96, 165, 250, 0.3);
  border-color: rgba(96, 165, 250, 0.5);
}

.main-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
}

.search-section {
  margin-bottom: 30px;
}

.selected-category-info {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #e7e9ff;
  color: #667eea;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.btn-close-category {
  background: transparent;
  border: none;
  color: #667eea;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s;
}

.btn-close-category:hover {
  background: rgba(102, 126, 234, 0.2);
}

.search-container {
  display: flex;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 14px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-button {
  padding: 14px 32px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.search-button:hover {
  background: #5568d3;
}

.products-section {
  margin-top: 0;
}

.products-section-content {
  width: 100%;
}

.loading-more,
.no-more {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 16px;
}

.loading-more {
  color: #667eea;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 18px;
}

.error {
  color: #e74c3c;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* 데스크톱 최적화 */
@media (min-width: 1400px) {
  .products-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (min-width: 1200px) and (max-width: 1399px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 240px;
  background: #f0f0f0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

.product-stock {
  font-size: 14px;
  color: #999;
}

/* 태블릿 및 모바일 반응형 */
@media (max-width: 1200px) {
  .sub-category-dropdown {
    min-width: 180px;
  }
}

@media (max-width: 991px) {
  .header-content {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 16px;
  }

  .category-menu-button {
    display: flex !important;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .category-menu-button:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .category-menu-button svg {
    width: 20px;
    height: 20px;
  }

  .category-nav {
    display: none;
  }

  .sub-categories-bar {
    display: none !important;
  }

  .sub-categories-close-button {
    display: none !important;
  }

  .sub-categories-content {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 0 16px;
  }

  .sub-category-group-title {
    font-size: 14px;
  }

  .sub-category-item {
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (max-width: 767px) {
  .header-content {
    padding: 10px 12px;
    flex-wrap: wrap;
    gap: 8px;
    height: auto;
    justify-content: space-between;
  }

  .logo {
    font-size: 18px;
    margin: 0;
    flex-shrink: 0;
  }

  .category-menu-button {
    padding: 8px 12px;
    font-size: 13px;
    gap: 6px;
    flex-shrink: 0;
  }

  .category-menu-button svg {
    width: 18px;
    height: 18px;
  }

  .header-actions {
    gap: 8px;
    flex-shrink: 0;
  }

  .category-nav {
    display: none;
  }

  .sub-categories-bar {
    padding: 16px 0;
  }

  .sub-categories-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 0 16px;
  }

  .sub-category-group-title {
    font-size: 13px;
  }

  .sub-category-item {
    padding: 6px 10px;
    font-size: 12px;
  }

  .header-actions {
    gap: 8px;
  }

  .user-info {
    font-size: 12px;
    display: none; /* 모바일에서는 사용자명 숨김 */
  }
}

/* Category Menu Button - 기본적으로 숨김, 모바일에서만 표시 */

/* Drawer Styles */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.drawer-overlay.active {
  opacity: 1;
  visibility: visible;
}

.category-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  width: 320px;
  max-width: 85vw;
  height: 100vh;
  background: #1e293b;
  z-index: 9999;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3);
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.category-drawer.open {
  right: 0;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.8);
}

.drawer-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.drawer-close-button {
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.drawer-close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.drawer-category-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.drawer-category-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.drawer-category-button:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.drawer-category-button.active {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.drawer-category-button .expand-icon {
  transition: transform 0.2s;
  color: rgba(255, 255, 255, 0.6);
}

.drawer-category-button.expanded .expand-icon {
  transform: rotate(180deg);
}

.drawer-subcategories {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: rgba(15, 23, 42, 0.5);
}

.drawer-subcategories.expanded {
  max-height: 1000px;
}

.drawer-subcategory-item {
  padding: 12px 20px 12px 40px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.drawer-subcategory-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  border-left-color: rgba(96, 165, 250, 0.5);
}

.drawer-subcategory-item.active {
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  border-left-color: #60a5fa;
  font-weight: 500;
}

@media (max-width: 480px) {
  .logout-button,
  .login-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  .main-content {
    padding: 20px 16px;
  }

  .search-container {
    flex-direction: column;
    gap: 8px;
  }

  .search-input {
    padding: 12px 16px;
    font-size: 16px; /* iOS 줌 방지 */
  }

  .search-button {
    padding: 12px;
    width: 100%;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .product-card {
    border-radius: 8px;
  }

  .product-image {
    height: 200px;
  }

  .product-info {
    padding: 16px;
  }

  .product-name {
    font-size: 16px;
  }

  .product-description {
    font-size: 13px;
  }

  .product-price {
    font-size: 18px;
  }

  .product-stock {
    font-size: 12px;
  }
}

@media (max-width: 500px) {
  .header-content {
    padding: 8px 10px;
    gap: 6px;
  }

  .logo {
    font-size: 16px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-menu-button {
    padding: 6px 10px;
    font-size: 12px;
    gap: 4px;
  }

  .category-menu-button svg {
    width: 16px;
    height: 16px;
  }

  .category-menu-button span {
    display: none;
  }

  .header-actions {
    gap: 6px;
  }

  .logout-button,
  .login-button {
    padding: 6px 10px;
    font-size: 11px;
  }

  .sub-categories-content {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .sub-category-group-title {
    font-size: 12px;
  }

  .sub-category-item {
    padding: 6px 10px;
    font-size: 11px;
  }

  .product-image {
    height: 180px;
  }
}
</style>

