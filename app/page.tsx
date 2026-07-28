"use client";

import { useEffect, useState } from "react";

interface Job {
  id: number;
  title: string;
  description: string;
  budget: number;
  duration: string;
  skills: string;
  status: string;
  job_id_onchain: string;
  created_at: string;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs")
      .then(r => r.json())
      .then(data => {
        if (data.success) setJobs(data.jobs.filter((j: Job) => j.status !== "completed"));
        setLoading(false);
      });
  }, []);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + "m ago";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h ago";
    return Math.floor(hrs / 24) + "d ago";
  };

  const statusBadge = (status: string) => {
    if (status === "open") return <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">Open</span>;
    if (status === "submitted") return <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">Submitted</span>;
    return <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full font-medium">Funded</span>;
  };

  const totalLocked = jobs.reduce((sum, j) => sum + (Number(j.budget) || 0), 0);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav — dark ink band, not a plain white bar */}
      <nav className="bg-gray-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-display font-semibold tracking-tight text-white">
            Giwa<span className="text-emerald-400">Guard</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/faucet" className="text-sm text-gray-300 hover:text-white transition-colors">Faucet</a>
            <a href="/wallet" className="text-sm text-gray-300 hover:text-white transition-colors">Wallet</a>
            <a href="/dashboard" className="text-sm text-gray-300 hover:text-white transition-colors">Dashboard</a>
            <a href="/post-job" className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              + Post a Job
            </a>
          </div>
        </div>
      </nav>

      {/* Hero — asymmetric split: copy on the left, a stacked "trust ledger" tile panel on the right */}
      <div className="bg-gray-900 pb-16 pt-4">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-10 items-center">
          <div className="md:col-span-3">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              Built on GIWA — Identity-Verified Escrow
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-5 tracking-tight leading-[1.1]">
              Trusted work,<br />verified on-chain.
            </h1>
            <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
              Every job is a smart contract. Every payment sits in ETH escrow until it&apos;s approved. Identity can be checked against GIWA&apos;s Dojang trust layer, with no platform fees and no middleman.
            </p>
            <a href="/post-job" className="inline-block bg-emerald-500 hover:bg-emerald-400 text-gray-900 px-6 py-3 rounded-xl text-sm font-semibold transition-colors">
              Post a Job →
            </a>
          </div>

          {/* Trust ledger panel: stacked tiles, each overlapping the one before it */}
          <div className="md:col-span-2">
            <div className="relative">
              {[
                { label: "Active jobs", value: loading ? "—" : String(jobs.length) },
                { label: "ETH in escrow", value: loading ? "—" : totalLocked.toFixed(4) },
                { label: "Platform fee", value: "0%" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="bg-gray-800 border border-white/10 rounded-2xl p-5 shadow-lg"
                  style={{ marginTop: i === 0 ? 0 : "-14px", marginLeft: `${i * 14}px`, position: "relative", zIndex: 10 - i }}
                >
                  <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Signature: overlapping giwa tiles — small on their own, strong when combined */}
      <div className="bg-gray-50" aria-hidden="true">
        <svg viewBox="0 0 400 16" preserveAspectRatio="none" className="w-full h-4 block">
          {Array.from({ length: 20 }).map((_, i) => (
            <path
              key={i}
              d={`M${i * 20} 0 a10 10 0 0 0 20 0 Z`}
              fill={i % 2 === 0 ? "var(--color-emerald-200)" : "var(--color-emerald-300)"}
            />
          ))}
        </svg>
      </div>

      {/* Jobs — staggered tile grid instead of a plain list */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-display font-semibold text-gray-900">Open Jobs</h2>
          <span className="text-sm text-gray-400">{jobs.length} available</span>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-sm">Loading jobs from GIWA...</div>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-4">🌱</div>
            <p className="text-gray-500 text-sm mb-4">No jobs yet. Be the first to post one.</p>
            <a href="/post-job" className="bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium">Post a Job</a>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {jobs.map((job, i) => (
            <a
              key={job.id}
              href={"/jobs/" + job.job_id_onchain}
              className="block bg-white border border-gray-100 rounded-2xl p-6 hover:border-emerald-200 hover:shadow-md transition-all group"
              style={{ marginTop: i % 2 === 1 ? "24px" : "0" }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                {statusBadge(job.status)}
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{job.description}</p>
              {job.skills && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {job.skills.split(",").map(s => (
                    <span key={s} className="text-xs bg-gray-50 text-gray-600 border border-gray-100 px-2 py-0.5 rounded-full">{s.trim()}</span>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-emerald-600">{job.budget} ETH</span>
                <span className="text-xs text-gray-400">{timeAgo(job.created_at)}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <span className="text-sm font-medium">Giwa<span className="text-emerald-500">Guard</span></span>
          <div className="flex gap-6">
            <a href="https://github.com/bayrakdarerdem/giwaguard" target="_blank" className="text-xs text-gray-400 hover:text-gray-600">GitHub</a>
            <a href="https://sepolia-explorer.giwa.io" target="_blank" className="text-xs text-gray-400 hover:text-gray-600">GIWA Explorer</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
