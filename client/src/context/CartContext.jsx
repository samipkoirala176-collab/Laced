import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { apiRequest } from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setItems([]);
      setTotal(0);
      return [];
    }

    setLoading(true);

    try {
      const cart = await apiRequest('/api/cart');
      const nextItems = cart?.items || [];
      setItems(nextItems);
      setTotal(cart?.total || 0);
      return nextItems;
    } catch (error) {
      if (error?.status !== 401) {
        showToast(error.message || 'Unable to load your cart.', 'error');
      }
      setItems([]);
      setTotal(0);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast, token]);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setTotal(0);
      return;
    }

    refreshCart();
  }, [isAuthenticated, refreshCart]);

  const syncCart = useCallback((cartData) => {
    const nextItems = cartData?.items || [];
    setItems(nextItems);
    setTotal(cartData?.total || 0);
    return nextItems;
  }, []);

  const addItem = useCallback(
    async ({ productSizeId, quantity }) => {
      if (!productSizeId) {
        showToast('Please select a size first.', 'error');
        return null;
      }

      try {
        const cart = await apiRequest('/api/cart/items', {
          method: 'POST',
          body: { productSizeId, quantity },
        });

        syncCart(cart);
        showToast('Item added to cart successfully.', 'success');
        return cart;
      } catch (error) {
        showToast(error.message || 'Unable to add the item to cart.', 'error');
        return null;
      }
    },
    [showToast, syncCart],
  );

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      try {
        const cart = await apiRequest(`/api/cart/items/${cartItemId}`, {
          method: 'PUT',
          body: { quantity },
        });

        syncCart(cart);
        return cart;
      } catch (error) {
        showToast(error.message || 'Unable to update the cart item.', 'error');
        return null;
      }
    },
    [showToast, syncCart],
  );

  const removeItem = useCallback(
    async (cartItemId) => {
      try {
        await apiRequest(`/api/cart/items/${cartItemId}`, { method: 'DELETE' });
        const nextItems = items.filter((item) => item.id !== cartItemId);
        const nextTotal = nextItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
        setItems(nextItems);
        setTotal(nextTotal);
        showToast('Item removed from cart.', 'success');
        return nextItems;
      } catch (error) {
        showToast(error.message || 'Unable to remove this item.', 'error');
        return null;
      }
    },
    [items, showToast],
  );

  const clearCart = useCallback(async () => {
    try {
      await apiRequest('/api/cart', { method: 'DELETE' });
      setItems([]);
      setTotal(0);
      showToast('Cart cleared successfully.', 'success');
      return true;
    } catch (error) {
      showToast(error.message || 'Unable to clear the cart.', 'error');
      return false;
    }
  }, [showToast]);

  const cartCount = useMemo(() => items.length, [items]);

  const value = useMemo(
    () => ({
      items,
      total,
      loading,
      cartCount,
      refreshCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [addItem, cartCount, clearCart, items, loading, refreshCart, removeItem, total, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
