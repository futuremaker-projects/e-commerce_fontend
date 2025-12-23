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

<style scoped>
.detail-container {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin: 0;
  cursor: pointer;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-button {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.3s;
}

.cart-button:hover {
  background: #218838;
}

.user-info {
  color: #666;
  font-size: 14px;
}

.logout-button {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.logout-button:hover {
  background: #c0392b;
}

.login-button {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.login-button:hover {
  background: #5568d3;
}

.main-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-image-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image-large {
  width: 100%;
  max-width: 500px;
  height: 500px;
  background: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.product-description-full {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.product-price-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 0;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.product-price-large {
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
}

.product-stock-info {
  font-size: 16px;
  color: #666;
}

.quantity-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quantity-section label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 80px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}

.quantity-input:focus {
  outline: none;
  border-color: #667eea;
}

.total-price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.total-label {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.total-price {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-cart,
.btn-order {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cart {
  background: #28a745;
  color: white;
}

.btn-cart:hover:not(:disabled) {
  background: #218838;
}

.btn-order {
  background: #667eea;
  color: white;
}

.btn-order:hover:not(:disabled) {
  background: #5568d3;
}

.btn-cart:disabled,
.btn-order:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.out-of-stock {
  padding: 16px;
  background: #fee;
  color: #e74c3c;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
}

.loading-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 100px 24px;
  text-align: center;
}

.loading {
  font-size: 18px;
  color: #666;
}

/* 반응형 */
@media (max-width: 991px) {
  .product-detail {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 30px;
  }

  .product-image-large {
    height: 400px;
  }

  .product-title {
    font-size: 28px;
  }

  .product-price-large {
    font-size: 32px;
  }
}

@media (max-width: 767px) {
  .header-content {
    padding: 0 16px;
  }

  .main-content {
    padding: 20px 16px;
  }

  .product-detail {
    padding: 20px;
  }

  .product-image-large {
    height: 300px;
  }

  .product-title {
    font-size: 24px;
  }

  .product-price-large {
    font-size: 28px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .cart-button {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>

