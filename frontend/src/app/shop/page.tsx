"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import API_URL from "@/lib/api";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

interface Message {
  role: "user" | "model";
  text: string;
}

const SESSION_ID = "demo-session-123";

function ShopPageInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hi! I am ShopPilot. What are you looking for today?" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentAsk = useRef(false);

  const refreshCartCount = () => {
    fetch(`${API_URL}/api/cart/${SESSION_ID}`)
      .then(res => res.json())
      .then(data => setCartCount(data.items?.length || 0))
      .catch(() => {});
  };

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
    refreshCartCount();
  }, []);

  // Handle ?ask= query param from product page
  useEffect(() => {
    const askParam = searchParams.get("ask");
    if (askParam && !hasSentAsk.current) {
      hasSentAsk.current = true;
      setChatInput(askParam);
      // Auto-send after a short delay
      setTimeout(() => {
        sendMessage(askParam);
      }, 500);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (overrideInput?: string) => {
    const msg = overrideInput || chatInput;
    if (!msg.trim()) return;

    const newMessages = [...messages, { role: "user", text: msg } as Message];
    setMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID, message: msg })
      });
      const data = await res.json();
      const replyText = data.response || "Sorry, I encountered an error.";
      setMessages([...newMessages, { role: "model", text: replyText }]);
      // Refresh cart count after every AI reply (AI may have added items)
      refreshCartCount();
    } catch (err) {
      setMessages([...newMessages, { role: "model", text: "Connection error. Is the backend running?" }]);
    }
    setChatLoading(false);
  };

  const sendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await sendMessage();
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <header className="flex justify-between items-center mb-12">
        <Link href="/">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            ShopPilot AI
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="outline" className="border-gray-700 text-white relative">
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="border-gray-700 text-white">Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* AI Chat Sidebar */}
        <aside className="md:col-span-1 border border-gray-800 bg-gray-950 p-6 rounded-2xl flex flex-col h-[75vh] sticky top-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            ShopPilot Agent
          </h2>
          <div className="flex-1 overflow-y-auto mb-4 border border-gray-800 rounded-xl p-4 bg-black flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`p-3 rounded-lg max-w-[90%] text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-indigo-600 self-end" : "bg-gray-800 self-start text-gray-300"}`}>
                {msg.text}
              </div>
            ))}
            {chatLoading && (
              <div className="p-3 rounded-lg bg-gray-800 self-start text-gray-300 max-w-[90%] text-sm flex gap-1">
                <span className="animate-bounce">.</span><span className="animate-bounce delay-75">.</span><span className="animate-bounce delay-150">.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendChatMessage} className="mt-auto flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="E.g. headphones under ₹3000..."
              className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              disabled={chatLoading}
            />
            <Button type="submit" disabled={chatLoading} className="bg-indigo-600 hover:bg-indigo-700">Send</Button>
          </form>
        </aside>

        {/* Main Product Grid */}
        <main className="md:col-span-3">
          <h2 className="text-3xl font-bold mb-8">All Products</h2>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="bg-gray-900 border-gray-800 overflow-hidden hover:border-indigo-600 transition duration-300 cursor-pointer h-full flex flex-col group">
                    <div className="h-48 overflow-hidden relative">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <Badge className="absolute top-2 right-2 bg-indigo-600">{product.category}</Badge>
                    </div>
                    <CardContent className="p-4 flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 border-t border-gray-800 flex justify-between items-center">
                      <span className="text-xl font-bold text-emerald-400">₹{product.price}</span>
                      <Button size="sm" variant="secondary" className="bg-gray-800 text-white hover:bg-gray-700">View</Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <ShopPageInner />
    </Suspense>
  );
}
