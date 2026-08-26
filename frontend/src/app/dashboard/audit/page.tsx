"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  session_id: string;
  action: string;
  details: string;
}

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/audit")
      .then(res => res.json())
      .then(data => {
        setLogs(data);
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
        <Link href="/dashboard">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            &larr; Back to Dashboard
          </h1>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">AI Audit Trail</h2>
        <p className="text-gray-400 mb-8">Transparent logs of AI decisions, recommendations, and checkout guardrail interactions.</p>
        
        {loading ? (
          <div>Loading logs...</div>
        ) : (
          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-12 border border-gray-800 rounded-xl">No AI activity recorded yet.</div>
            ) : logs.map((log, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={
                      log.action === "checkout_started" ? "bg-amber-600" :
                      log.action === "payment_success" ? "bg-emerald-600" :
                      "bg-indigo-600"
                    }>
                      {log.action.replace("_", " ").toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500 font-mono">Session: {log.session_id}</span>
                  </div>
                  <p className="text-gray-300">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
