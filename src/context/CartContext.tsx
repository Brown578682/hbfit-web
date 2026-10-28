"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createCart,
  addCartLines,
  updateCartLines,
  removeCartLines,
  getCart,
  ShopifyCart,
} from "@/lib/shopify";

interface CartContextValue {
  cart: ShopifyCart | null;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_ID_KEY = "hbfit_cart_id";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const cartIdRef = useRef<string | null>(null);

  // On mount: restore existing cart
  useEffect(() => {
    const stored = typeof window !== "undefined"
      ? localStorage.getItem(CART_ID_KEY)
      : null;
    if (!stored) return;
    cartIdRef.current = stored;
    getCart(stored)
      .then((c) => {
        if (c) {
          setCart(c);
        } else {
          // Cart expired on Shopify side
          localStorage.removeItem(CART_ID_KEY);
          cartIdRef.current = null;
        }
      })
      .catch(() => {
        localStorage.removeItem(CART_ID_KEY);
        cartIdRef.current = null;
      });
  }, []);

  const persistCart = useCallback((c: ShopifyCart) => {
    cartIdRef.current = c.id;
    localStorage.setItem(CART_ID_KEY, c.id);
    setCart(c);
  }, []);

  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      setLoading(true);
      try {
        let updatedCart: ShopifyCart;
        if (!cartIdRef.current) {
          updatedCart = await createCart(variantId, quantity);
        } else {
          updatedCart = await addCartLines(cartIdRef.current, variantId, quantity);
        }
        persistCart(updatedCart);
        setCartOpen(true);
      } finally {
        setLoading(false);
      }
    },
    [persistCart]
  );

  const updateLine = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartIdRef.current) return;
      setLoading(true);
      try {
        const updatedCart = await updateCartLines(cartIdRef.current, lineId, quantity);
        persistCart(updatedCart);
      } finally {
        setLoading(false);
      }
    },
    [persistCart]
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!cartIdRef.current) return;
      setLoading(true);
      try {
        const updatedCart = await removeCartLines(cartIdRef.current, [lineId]);
        persistCart(updatedCart);
      } finally {
        setLoading(false);
      }
    },
    [persistCart]
  );

  return (
    <CartContext.Provider
      value={{ cart, cartOpen, setCartOpen, addToCart, updateLine, removeLine, loading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
