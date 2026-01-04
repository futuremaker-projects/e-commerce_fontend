<template>
  <div class="detail-container">
    <header class="header">
      <div class="header-content">
        <h1 class="logo" @click="goHome">B2B 이커머스</h1>
        <div class="header-actions">
          <button @click="goToCart" class="cart-button">
            장바구니 ({{ cartStore.totalItems }})
          </button>
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

    <main class="main-content" v-if="product">
      <div class="product-detail">
        <div class="product-image-section">
          <div class="product-image-large">
            <img
              :src="product.imageUrl || '/placeholder-image.png'"
              :alt="product.name"
              @error="handleImageError"
            />
          </div>
        </div>

        <div class="product-info-section">
          <h1 class="product-title">{{ product.name }}</h1>
          <p class="product-description-full">{{ product.description }}</p>
          
          <div class="product-price-section">
            <span class="product-price-large">{{ formatPrice(product.price) }}원</span>
            <span class="product-stock-info">재고: {{ product.stock }}개</span>
          </div>

          <div class="quantity-section">
            <label for="quantity">수량:</label>
            <div class="quantity-controls">
              <button
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
                class="quantity-btn"
              >
                -
              </button>
              <input
                id="quantity"
                v-model.number="quantity"
                type="number"
                min="1"
                :max="product.stock"
                class="quantity-input"
              />
              <button
                @click="increaseQuantity"
                :disabled="quantity >= product.stock"
                class="quantity-btn"
              >
                +
              </button>
            </div>
          </div>

          <div class="total-price-section">
            <span class="total-label">총 금액:</span>
            <span class="total-price">{{ formatPrice(product.price * quantity) }}원</span>
          </div>

          <div class="action-buttons">
            <button
              @click="addToCart"
              class="btn-cart"
              :disabled="product.stock === 0"
            >
              장바구니 담기
            </button>
            <button
              @click="orderNow"
              class="btn-order"
              :disabled="product.stock === 0"
            >
              주문하기
            </button>
          </div>

          <div v-if="product.stock === 0" class="out-of-stock">
            품절된 상품입니다.
          </div>
        </div>
      </div>
    </main>

    <div v-else class="loading-container">
      <div class="loading">상품 정보를 불러오는 중...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { useProductStore } from '@/store/product'
import { dummyProducts } from '@/utils/dummyData'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const productStore = useProductStore()

const product = ref(null)
const quantity = ref(1)

const productId = computed(() => parseInt(route.params.id))

onMounted(() => {
  loadProduct()
})

function loadProduct() {
  // 더미 데이터에서 상품 찾기
  const foundProduct = dummyProducts.find(p => p.id === productId.value)
  if (foundProduct) {
    product.value = { ...foundProduct }
  } else {
    // 실제 API 호출 (나중에 사용)
    // productStore.getProduct(productId.value).then(response => {
    //   product.value = response.data
    // })
    router.push('/')
  }
}

function increaseQuantity() {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function addToCart() {
  cartStore.addToCart(product.value, quantity.value)
  alert('장바구니에 추가되었습니다.')
}

function orderNow() {
  cartStore.addToCart(product.value, quantity.value)
  router.push('/cart')
}

function goHome() {
  router.push('/')
}

function goToCart() {
  router.push('/cart')
}

function handleLogout() {
  authStore.logoutUser()
}

function handleLogin() {
  router.push('/login')
}

function formatPrice(price) {
  if (!price) return '0'
  return new Intl.NumberFormat('ko-KR').format(price)
}

function handleImageError(event) {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
}
</script>

<style scoped src="./css/ProductDetailView.css"></style>

