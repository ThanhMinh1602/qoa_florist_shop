import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'qoa_shop_cart'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCart())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    function addItem(product, quantity = 1) {
      const qty = Math.max(1, Number(quantity) || 1)
      setItems((previous) => {
        const existing = previous.find((item) => item.productId === product.id)
        if (existing) {
          return previous.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + qty }
              : item,
          )
        }
        return [
          ...previous,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            mainImage: product.mainImage || '',
            quantity: qty,
          },
        ]
      })
    }

    function setQuantity(productId, quantity) {
      const qty = Math.max(0, Number(quantity) || 0)
      setItems((previous) => {
        if (qty <= 0) return previous.filter((item) => item.productId !== productId)
        return previous.map((item) =>
          item.productId === productId ? { ...item, quantity: qty } : item,
        )
      })
    }

    function removeItem(productId) {
      setItems((previous) => previous.filter((item) => item.productId !== productId))
    }

    function clearCart() {
      setItems([])
    }

    return {
      items,
      count,
      subtotal,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
