<template>
  <div class="cart-container">
    <header class="header">
      <div class="header-content">
        <h1 class="logo" @click="goHome">B2B 이커머스</h1>
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

    <main class="main-content">
      <div class="cart-header">
        <h2 class="cart-title">장바구니</h2>
        <span class="cart-count">총 {{ cartStore.totalItems }}개</span>
      </div>

      <div v-if="cartStore.items.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <p class="empty-text">장바구니가 비어있습니다.</p>
        <button @click="goHome" class="btn-shopping">쇼핑하러 가기</button>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="cart-item"
          >
            <div class="item-image">
              <img
                :src="item.imageUrl || '/placeholder-image.png'"
                :alt="item.name"
                @error="handleImageError"
              />
            </div>
            <div class="item-info">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-description">{{ item.description }}</p>
              <div class="item-price">{{ formatPrice(item.price) }}원</div>
            </div>
            <div class="item-quantity">
              <div class="quantity-controls">
                <button
                  @click="decreaseQuantity(item.id)"
                  class="quantity-btn"
                >
                  -
                </button>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  :max="item.stock"
                  @change="updateQuantity(item.id, item.quantity)"
                  class="quantity-input"
                />
                <button
                  @click="increaseQuantity(item.id)"
                  :disabled="item.quantity >= item.stock"
                  class="quantity-btn"
                >
                  +
                </button>
              </div>
              <div class="item-total">
                {{ formatPrice(item.price * item.quantity) }}원
              </div>
            </div>
            <button
              @click="removeItem(item.id)"
              class="remove-btn"
              title="삭제"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-header">
            <h3>주문 요약</h3>
          </div>
          <div class="summary-content">
            <div class="summary-row">
              <span>상품 개수</span>
              <span>{{ cartStore.totalItems }}개</span>
            </div>
            <div class="summary-row">
              <span>상품 금액</span>
              <span>{{ formatPrice(cartStore.totalPrice) }}원</span>
            </div>
            <div class="summary-row">
              <span>배송비</span>
              <span>무료</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total">
              <span>총 결제금액</span>
              <span class="total-amount">{{ formatPrice(cartStore.totalPrice) }}원</span>
            </div>
          </div>
          <div class="summary-actions">
            <button @click="clearCart" class="btn-clear">장바구니 비우기</button>
            <button @click="checkout" class="btn-checkout">주문하기</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

function goHome() {
  router.push('/')
}

function handleLogout() {
  authStore.logoutUser()
}

function handleLogin() {
  router.push('/login')
}

function increaseQuantity(itemId) {
  const item = cartStore.items.find(i => i.id === itemId)
  if (item && item.quantity < item.stock) {
    cartStore.updateQuantity(itemId, item.quantity + 1)
  }
}

function decreaseQuantity(itemId) {
  const item = cartStore.items.find(i => i.id === itemId)
  if (item && item.quantity > 1) {
    cartStore.updateQuantity(itemId, item.quantity - 1)
  }
}

function updateQuantity(itemId, quantity) {
  if (quantity < 1) {
    cartStore.removeFromCart(itemId)
  } else {
    const item = cartStore.items.find(i => i.id === itemId)
    if (item && quantity > item.stock) {
      quantity = item.stock
    }
    cartStore.updateQuantity(itemId, quantity)
  }
}

function removeItem(itemId) {
  if (confirm('장바구니에서 삭제하시겠습니까?')) {
    cartStore.removeFromCart(itemId)
  }
}

function clearCart() {
  if (confirm('장바구니를 비우시겠습니까?')) {
    cartStore.clearCart()
  }
}

function checkout() {
  if (!authStore.isAuthenticated) {
    alert('주문하려면 로그인이 필요합니다.')
    router.push('/login')
    return
  }
  
  // 주문 처리 로직 (나중에 구현)
  alert('주문이 완료되었습니다!')
  cartStore.clearCart()
  router.push('/')
}

function formatPrice(price) {
  if (!price) return '0'
  return new Intl.NumberFormat('ko-KR').format(price)
}

function handleImageError(event) {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
}
</script>

<style scoped>
.cart-container {
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

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.cart-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.cart-count {
  font-size: 18px;
  color: #666;
}

.empty-cart {
  background: white;
  border-radius: 12px;
  padding: 80px 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.btn-shopping {
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

.btn-shopping:hover {
  background: #5568d3;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 120px 1fr auto auto;
  gap: 20px;
  align-items: center;
}

.item-image {
  width: 120px;
  height: 120px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.item-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price {
  font-size: 16px;
  color: #999;
}

.item-quantity {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  font-size: 18px;
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
  width: 60px;
  height: 32px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

.quantity-input:focus {
  outline: none;
  border-color: #667eea;
}

.item-total {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

.remove-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #fee;
  color: #e74c3c;
  border-radius: 6px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #fcc;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 100px;
}

.summary-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
}

.summary-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  color: #666;
}

.summary-row.total {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.total-amount {
  color: #667eea;
  font-size: 24px;
}

.summary-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 8px 0;
}

.summary-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-clear,
.btn-checkout {
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-clear {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e0e0e0;
}

.btn-clear:hover {
  background: #e9ecef;
}

.btn-checkout {
  background: #667eea;
  color: white;
}

.btn-checkout:hover {
  background: #5568d3;
}

/* 반응형 */
@media (max-width: 991px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 767px) {
  .header-content {
    padding: 0 16px;
  }

  .main-content {
    padding: 20px 16px;
  }

  .cart-title {
    font-size: 24px;
  }

  .cart-item {
    grid-template-columns: 100px 1fr;
    gap: 16px;
  }

  .item-image {
    width: 100px;
    height: 100px;
  }

  .item-quantity {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #e0e0e0;
  }

  .remove-btn {
    position: absolute;
    top: 20px;
    right: 20px;
  }

  .cart-item {
    position: relative;
  }
}
</style>

