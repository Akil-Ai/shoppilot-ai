"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import API_URL from "@/lib/api";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  features: string;
}

const SESSION_ID = "demo-session-123";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Get current cart count
    fetch(`${API_URL}/api/cart/${SESSION_ID}`)
      .then(res => res.json())
      .then(data => setCartCount(data.items?.length || 0));
  }, [resolvedParams.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      const res = await fetch(`${API_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID, product_id: product.id, quantity: 1 })
      });
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.items?.length || 0);
        setAddedFeedback(true);
        setTimeout(() => setAddedFeedback(false), 2000);
      }
    } catch (err) {
      console.error("Failed to add to cart", err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAskAI = () => {
    // Navigate to shop with a pre-filled query about this product
    if (product) {
      router.push(`/shop?ask=Tell+me+more+about+${encodeURIComponent(product.name)}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex justify-center items-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-black text-white flex justify-center items-center">Product not found.</div>;
  }

  let features: string[] = [];
  try {
    features = JSON.parse(product.features || "[]");
  } catch {
    features = [];
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <header className="flex justify-between items-center mb-12">
        <Link href="/shop">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            &larr; Back to Shop
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="outline" className="border-gray-700 text-white relative">
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex flex-col justify-center">
          <Badge className="w-fit mb-4 bg-indigo-600">{product.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-emerald-400 mb-6">₹{product.price}</p>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">{product.description}</p>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-white">Key Features</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              {features.map((f: string, i: number) => <li key={i}>{f}</li>)}
            </ul>
          </div>
          
          <div className="flex gap-4">
            <Button
              id="add-to-cart-btn"
              size="lg"
              onClick={handleAddToCart}
              disabled={addingToCart}
              className={`flex-1 text-lg py-6 rounded-xl transition duration-300 ${
                addedFeedback
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
              }`}
            >
              {addingToCart ? "Adding..." : addedFeedback ? "✓ Added to Cart!" : "Add to Cart"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleAskAI}
              className="border-gray-700 text-white hover:bg-gray-800 text-lg py-6 rounded-xl"
            >
              Ask AI about this
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
