"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/products/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex justify-center items-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-black text-white flex justify-center items-center">Product not found.</div>;
  }

  const features = JSON.parse(product.features || "[]");

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
            <Button variant="outline" className="border-gray-700 text-white">Cart</Button>
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
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 text-lg py-6 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.5)] transition duration-300">
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="border-gray-700 text-white hover:bg-gray-800 text-lg py-6 rounded-xl">
              Ask AI about this
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
