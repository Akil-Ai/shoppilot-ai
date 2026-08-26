"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // For MVP, we use a single hardcoded sessionId to sync with the backend if we don't have global state.
  // In a real app, sessionId would be in context/local storage.
  // Since we randomly generate it in /shop, we might need a workaround for the MVP to share the session ID.
  // For simplicity, let's use a fixed session id for demo purposes.
  // Oh wait, in the shop page, we used random. Let me update the shop page to use a static one for demo, or localStorage.
  
  const sessionId = "demo-session-123";

  useEffect(() => {
    fetch(`http://localhost:8000/api/cart/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.items);
        setTotal(data.total);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex justify-center items-center">Loading cart...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <header className="flex justify-between items-center mb-12">
        <Link href="/shop">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            &larr; Continue Shopping
          </h1>
        </Link>
      </header>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
        
        {items.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl mb-6">Your cart is empty.</p>
            <Link href="/shop">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="space-y-6 mb-8">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                  <div>
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <p className="text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xl font-bold text-emerald-400">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-800 pt-6 flex justify-between items-center mb-8">
              <span className="text-2xl font-bold">Total</span>
              <span className="text-3xl font-bold text-emerald-400">₹{total}</span>
            </div>
            
            <Link href="/checkout">
              <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6 rounded-xl">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
