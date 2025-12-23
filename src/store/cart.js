import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('cart') || '[]'))

  // 장바구니 총 개수
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // 장바구니 총 금액
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  // localStorage에 저장
  function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  // 장바구니에 추가
  function addToCart(product, quantity = 1) {
    const existingItem = items.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        quantity: quantity
      })
    }
    
    saveToLocalStorage()
  }

  // 장바구니에서 제거
  function removeFromCart(productId) {
    items.value = items.value.filter(item => item.id !== productId)
    saveToLocalStorage()
  }

  // 수량 업데이트
  function updateQuantity(productId, quantity) {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
        saveToLocalStorage()
      }
    }
  }

  // 장바구니 비우기
  function clearCart() {
    items.value = []
    saveToLocalStorage()
  }

  // 상품이 장바구니에 있는지 확인
  function isInCart(productId) {
    return items.value.some(item => item.id === productId)
  }

  return {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart
  }
})
