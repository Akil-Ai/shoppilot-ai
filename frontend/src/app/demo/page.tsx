"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
  const [step, setStep] = useState(0);

  const demoSteps = [
    {
      title: "1. Intent Detection & Recommendation",
      desc: "User asks: 'I need wireless headphones under ₹3000 for coding and travel.' The AI understands the intent, filters by price and category, and recommends SoundMax Pro.",
      action: "Go to Shop & Ask AI",
      link: "/shop"
    },
    {
      title: "2. Upsell Suggestion",
      desc: "After viewing headphones, the AI suggests adding a 'Laptop Riser' or 'Power Bank' since the user mentioned coding and travel.",
      action: "Try it in Shop",
      link: "/shop"
    },
    {
      title: "3. Cart Management & Safety Guard",
      desc: "The AI safely adds items to the cart ONLY after user confirmation. Then the AI uses 'request_checkout_confirmation()' to transition.",
      action: "View Cart",
      link: "/cart"
    },
    {
      title: "4. Razorpay Test Checkout (Success)",
      desc: "The user proceeds to checkout. A Razorpay Test Mode order is created server-side. The user completes payment using a test card, and the webhook/API verifies the signature.",
      action: "Go to Checkout",
      link: "/checkout"
    },
    {
      title: "5. Payment Failure Scenario",
      desc: "During checkout, if the user cancels or uses a failing test card, ShopPilot gracefully handles the error. No order is marked as paid.",
      action: "Simulate Failure",
      link: "/checkout?fail=true" // Handled by standard checkout page but we can just say close the popup
    },
    {
      title: "6. Merchant Dashboard & Audit Log",
      desc: "The merchant dashboard updates with the new AI-assisted revenue. The AI Audit Trail logs every decision, from intent to checkout.",
      action: "View Dashboard",
      link: "/dashboard"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <header className="flex justify-between items-center mb-12 max-w-4xl mx-auto">
        <Link href="/">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            ShopPilot AI Demo
          </h1>
        </Link>
        <Link href="/">
          <Button variant="outline" className="border-gray-700 text-white">Exit Demo</Button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl mb-12 text-center">
          <h2 className="text-4xl font-extrabold mb-6">Welcome to the 5-Minute Pitch</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            This demo showcases the complete end-to-end flow of ShopPilot AI. 
            Follow the steps below to experience how our AI agent increases merchant revenue while maintaining strict safety guardrails.
          </p>
        </div>

        <div className="space-y-6">
          {demoSteps.map((s, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border transition-all duration-300 ${step === idx ? 'bg-indigo-900/30 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-gray-900 border-gray-800 opacity-70 hover:opacity-100'}`} onClick={() => setStep(idx)}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">{s.title}</h3>
                {step === idx && <span className="bg-indigo-600 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Current Step</span>}
              </div>
              <p className="text-gray-400 mb-6 text-lg">{s.desc}</p>
              {step === idx && (
                <Link href={s.link}>
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto">
                    {s.action}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
