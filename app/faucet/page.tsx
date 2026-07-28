"use client";

import { useEffect, useState } from "react";

export default function FaucetPage() {
  const [faucets, setFaucets] = useState([] as any[]);

  useEffect(() => {
    fetch("/api/faucet").then(r => r.json()).then(d => setFaucets(d.faucets || []));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-display font-semibold">Giwa<span className="text-emerald-600">Guard</span></span>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-900">Browse Jobs</a>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🚰</div>
          <h1 className="text-2xl font-display font-semibold text-gray-900 mb-2">Testnet Faucet</h1>
          <p className="text-sm text-gray-500">Get free test ETH on GIWA Sepolia to try GiwaGuard.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 space-y-3">
          {faucets.map((f) => (
            <a
              key={f.name}
              href={f.url}
              target="_blank"
              className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <p className="text-sm font-medium text-gray-900">{f.name}</p>
              <p className="text-xs text-gray-500 mt-1">{f.limit}</p>
            </a>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-700 mb-2">How to use GiwaGuard:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs text-emerald-600 font-medium w-4">1.</span>
              <p className="text-xs text-gray-500">Get test ETH from a GIWA faucet above</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-emerald-600 font-medium w-4">2.</span>
              <p className="text-xs text-gray-500">Post a job — ETH locks in escrow automatically</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-emerald-600 font-medium w-4">3.</span>
              <p className="text-xs text-gray-500">Freelancer delivers — payment releases on-chain</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
