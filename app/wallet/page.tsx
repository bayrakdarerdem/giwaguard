"use client";

import { useState } from "react";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("send" as "bridge" | "identity" | "send");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null as any);
  const [sendAmount, setSendAmount] = useState("1");
  const [sendTo, setSendTo] = useState("");

  async function handleSend() {
    if (!sendTo.startsWith("0x")) {
      setResult({ success: false, error: "Invalid recipient address" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/wallet/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: sendAmount, to: sendTo }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    }
    setLoading(false);
  }

  const explorerUrl = result?.txHash ? "https://sepolia-explorer.giwa.io/tx/" + result.txHash : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-display font-semibold">Giwa<span className="text-emerald-600">Guard</span></span>
        <a href="/" className="text-sm text-gray-500">Browse Jobs</a>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-display font-semibold text-gray-900 mb-2">Wallet</h1>
        <p className="text-sm text-gray-500 mb-6">Bridge ETH, check Dojang identity status, and send ETH on GIWA.</p>

        <div className="flex gap-2 mb-6">
          {(["bridge", "identity", "send"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResult(null); }}
              className={"flex-1 py-2 rounded-lg text-sm font-medium border transition-colors " + (activeTab === tab ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200")}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">

          {activeTab === "bridge" && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800 font-medium">Bridge ETH: Ethereum Sepolia ↔ GIWA Sepolia</p>
                <p className="text-xs text-blue-700 mt-1">GIWA&apos;s official bridge moves ETH between Ethereum Sepolia and GIWA Sepolia (standard OP Stack bridge).</p>
              </div>
              <a href="https://bridge-giwa.vercel.app" target="_blank" className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium text-center block hover:bg-gray-50">
                Go to GIWA Bridge
              </a>
            </div>
          )}

          {activeTab === "identity" && (
            <div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-purple-800 font-medium">Dojang-style identity check</p>
                <p className="text-xs text-purple-700 mt-1">GiwaGuardEscrow exposes a verifiedIdentity flag as a placeholder for GIWA&apos;s Dojang attestation service (Upbit KYC, via EAS). Once GIWA publishes a stable Dojang registry address, this reads from it directly.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600">Check a job&apos;s client/freelancer verification status from the job detail page — this tab is a placeholder until the real Dojang registry address is available.</p>
              </div>
            </div>
          )}

          {activeTab === "send" && (
            <div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-emerald-800">Send ETH to any wallet address on GIWA Testnet.</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={sendTo}
                  onChange={e => setSendTo(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETH)</label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={e => setSendAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {result?.success && explorerUrl && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-emerald-800 font-medium">ETH sent successfully!</p>
                  <a href={explorerUrl} target="_blank" className="text-xs text-emerald-600 hover:underline">View on GIWA Explorer</a>
                </div>
              )}

              {result && !result.success && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-red-800">{result.error}</p>
                </div>
              )}

              <button
                onClick={handleSend}
                disabled={loading || !sendTo}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send ETH"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          Built on GIWA (OP Stack) — verifiable on GIWA Explorer
        </div>
      </div>
    </main>
  );
}
