"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products from backend
    fetch("http://localhost:8000/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

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
            <Button variant="outline" className="border-gray-700 text-white">Cart</Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left sidebar / AI Agent placeholder */}
        <aside className="md:col-span-1 border border-gray-800 bg-gray-950 p-6 rounded-2xl flex flex-col h-[70vh] sticky top-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            ShopPilot Agent
          </h2>
          <div className="flex-1 overflow-y-auto mb-4 border border-gray-800 rounded-xl p-4 bg-black">
            <p className="text-gray-400 text-sm">Hi! I am ShopPilot. What are you looking for today?</p>
          </div>
          <div className="mt-auto">
            <input 
              type="text" 
              placeholder="E.g. headphones under ₹3000..." 
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
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
                  <Card className="bg-gray-900 border-gray-800 overflow-hidden hover:border-gray-600 transition duration-300 cursor-pointer h-full flex flex-col group">
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
