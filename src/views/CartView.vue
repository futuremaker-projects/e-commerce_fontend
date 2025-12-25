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

<style scoped src="./CartView.css"></style>

