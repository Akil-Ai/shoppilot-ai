"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <header className="flex justify-between items-center mb-12">
        <Link href="/">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            ShopPilot AI Dashboard
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/audit">
            <Button variant="outline" className="border-gray-700 text-white">AI Audit Trail</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-gray-700 text-white">Storefront</Button>
          </Link>
        </div>
      </header>

      {loading || !stats ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        <main className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Performance Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-400 text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">₹{stats.total_revenue}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-indigo-900 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-indigo-400 text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  AI-Assisted Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">₹{stats.ai_assisted_revenue}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  AI Upsell Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">₹{stats.upsell_revenue}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-400 text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.orders_count}</div>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-2xl font-bold mb-6">Recent Transactions</h3>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950 border-b border-gray-800 text-gray-400">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No transactions yet.</td>
                  </tr>
                ) : stats.recent_transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                    <td className="p-4">#{tx.id}</td>
                    <td className="p-4">{tx.email}</td>
                    <td className="p-4 text-emerald-400">₹{tx.amount}</td>
                    <td className="p-4">
                      <span className="bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
                        {tx.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}
    </div>
  );
}
