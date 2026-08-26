"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sessionId = "demo-session-123";

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    
    try {
      // 1. Create order on backend
      const res = await fetch("http://localhost:8000/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: "checkout" })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Failed to create order");
      }

      // 2. Mock mode handling
      if (data.key === "mock_id" || data.key === "mock_rp_id") {
        alert("Mock Mode: Payment Simulated Successfully!");
        // Simulate verify
        await fetch("http://localhost:8000/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            razorpay_order_id: data.order_id,
            razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
            razorpay_signature: "mock_sig"
          })
        });
        router.push("/dashboard");
        return;
      }

      // 3. Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopPilot AI",
        description: "Test Transaction",
        order_id: data.order_id,
        handler: async function (response: any) {
          // Verify payment on backend
          const verifyRes = await fetch("http://localhost:8000/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            router.push("/dashboard");
          } else {
            setError(verifyData.detail || "Payment verification failed");
          }
        },
        prefill: {
          name: "Demo User",
          email: "demo@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#4f46e5"
        }
      };
      
      // @ts-ignore
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        setError("Payment unsuccessful. Your order has NOT been charged.");
        // We could also notify backend about failure here
      });
      rzp1.open();

    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 flex flex-col items-center">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-3xl font-bold mb-6">Secure Checkout</h1>
        <p className="text-gray-400 mb-8">You are about to complete your purchase powered by Razorpay Test Mode.</p>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}
        
        <Button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6 rounded-xl"
        >
          {loading ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </div>
  );
}
