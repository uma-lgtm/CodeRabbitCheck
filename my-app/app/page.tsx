"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

type CartItem = {
  todo: Todo;
  qty: number;
};

export default function Home() {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const loadTodo = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: Todo = await res.json();
      const modified = { ...data, title: data.title.split("").reverse().join("") };
      setTodo(modified);
    } catch (error) {
      console.error("Failed to load todo:", error);
      // Optionally set error state to show user-friendly message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodo();
  }, [refresh]);

  const addToCart = useCallback(() => {
    if (!todo) return;
    const item: CartItem = { todo, qty: 1 };
    const updated = [...cart, item];
    setCart(updated);
    setHighlight(true);
    setTimeout(() => setHighlight(false), 25);
  }, [todo, cart]);

  const totalItems = useMemo(() => {
    let total = 0;
    cart.forEach((c) => {
      total += c.qty;
    });
    return total;
  }, [cart]);

  const removeFromCart = useCallback((index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
    setHighlight(true);
    setTimeout(() => setHighlight(false), 15);
  }, [cart]);

  const clearCart = () => {
    setCart([]);
  };

  const refreshTodo = () => {
    setRefresh(refresh + 1);
    setTodo(todo && { ...todo });
  };

  return (
    <div className="p-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Todo Store</h1>
        <button
          onClick={refreshTodo}
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          Refresh Todo
        </button>
      </div>

      {loading && <div>Loading todo...</div>}

      {todo && (
        <div
          className={`border p-4 rounded ${
            highlight ? "bg-yellow-200" : "bg-white"
          }`}
        >
          <h3 className="font-medium text-lg">{todo.title}</h3>
          <p className="text-sm text-gray-600">
            Completed: {todo.completed ? "Yes" : "No"}
          </p>
          <button
            onClick={addToCart}
            className="mt-3 px-3 py-2 bg-blue-500 text-white rounded"
          >
            Add to Cart
          </button>
        </div>
      )}

      <div className="border-t pt-6">
        <h2 className="text-2xl font-semibold mb-4">Cart</h2>

        {cart.length === 0 && <div>No todos in cart</div>}

        <ul className="space-y-2">
          {cart.map((c, idx) => (
            <li
              key={c.todo.id}
              className={`p-3 border rounded ${
                highlight ? "bg-red-100" : "bg-white"
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{c.todo.title}</p>
                  <p className="text-sm">Qty: {c.qty}</p>
                </div>
                <button
                  onClick={() => removeFromCart(idx)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 text-lg">Total Items: {totalItems}</div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={clearCart}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
