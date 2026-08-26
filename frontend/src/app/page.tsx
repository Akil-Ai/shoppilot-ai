import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          ShopPilot AI
        </h1>
        <nav className="flex gap-4">
          <Link href="/shop" className="text-gray-300 hover:text-white transition">Shop</Link>
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">AI-powered</span> sales agent.
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl">
          Experience the future of commerce. Our AI agent understands your needs, recommends the perfect products, and guides you through a seamless checkout.
        </p>
        
        <div className="flex gap-4">
          <Link href="/shop">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6 rounded-full font-semibold">
              Start Shopping
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="outline" className="border-gray-700 text-black hover:bg-gray-800 text-lg px-8 py-6 rounded-full font-semibold">
              View Demo
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
