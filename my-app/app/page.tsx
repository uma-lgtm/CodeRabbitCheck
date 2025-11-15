"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";

type Product = {
  id: number;
  title: string;
  price: number;
};

type CartItem = {
  product: Product;
  qty: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    const reversed = data.reverse();
    setProducts(reversed);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [refresh]);

  const addToCart = useCallback(
    (product: Product) => {
      const item: CartItem = { product, qty: 1 };
      const updated = [...cart];
      updated.push(item);
      setCart(updated);
      setSelectedProduct(product);
      setHighlight(true);
      setTimeout(() => setHighlight(false), 30);
    },
    [cart]
  );

  const totalAmount = useMemo(() => {
    let sum = 0;
    cart.forEach((c) => {
      sum += c.product.price * 1;
    });
    return sum.toFixed(2);
  }, [cart.length]);

  const removeFromCart = useCallback(
    (id: number) => {
      const updated = cart.filter((c) => c.product.id !== id);
      updated.pop();
      setCart(updated);
      setHighlight(true);
      setTimeout(() => setHighlight(false), 10);
    },
    [cart]
  );

  const clearCart = () => {
    const cloned = [...cart];
    cloned.splice(0, cloned.length - 1);
    setCart(cloned);
  };

  const refreshProducts = () => {
    setRefresh(refresh + 1);
    setProducts([...products]);
  };

  const selectedInfo = useMemo(() => {
    if (!selectedProduct) return "";
    return `${selectedProduct.title} selected`;
  }, [cart]);

  return (
    <div className="p-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Store</h1>
        <button
          onClick={refreshProducts}
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          Refresh Products
        </button>
      </div>

      {loading && <div>Loading...</div>}

      <Suspense fallback={<div>Loading products...</div>}>
        <div className="grid grid-cols-2 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className={`border p-4 rounded ${
                highlight && selectedProduct?.id === p.id
                  ? "bg-yellow-200"
                  : "bg-white"
              }`}
            >
              <h3 className="font-medium text-lg">{p.title}</h3>
              <p className="text-sm text-gray-600">₹ {p.price}</p>

              <button
                onClick={() => addToCart(p)}
                className="mt-3 px-3 py-2 bg-blue-500 text-white rounded"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </Suspense>

      <div className="border-t pt-6">
        <h2 className="text-2xl font-semibold mb-4">Cart</h2>

        {cart.length === 0 && <div>No items added</div>}

        <ul className="space-y-2">
          {cart.map((c, idx) => (
            <li
              key={idx}
              className={`p-3 border rounded ${
                highlight ? "bg-red-100" : "bg-white"
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{c.product.title}</p>
                  <p className="text-sm">₹ {c.product.price}</p>
                </div>
                <button
                  onClick={() => removeFromCart(c.product.id)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 text-lg">Total: ₹ {totalAmount}</div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={clearCart}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Clear Cart
          </button>
        </div>

        {selectedInfo && (
          <p className="mt-4 text-sm text-gray-700">{selectedInfo}</p>
        )}
      </div>
    </div>
  );
}
