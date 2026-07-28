import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseEther } from "viem";
import { publicClient, getWalletClient, explorerTxUrl, giwaSepolia } from "@/lib/giwa";
import { GIWAGUARD_ESCROW_ADDRESS, GIWAGUARD_ESCROW_ABI } from "@/lib/contract";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, budget, duration, skills } = await req.json();
    const client = getWalletClient("CLIENT_PRIVATE_KEY");
    const freelancerAddress = process.env.FREELANCER_WALLET_ADDRESS as `0x${string}`;

    // 1. Create the job on-chain
    const createHash = await client.writeContract({
      chain: giwaSepolia,
      account: client.account!,
      address: GIWAGUARD_ESCROW_ADDRESS,
      abi: GIWAGUARD_ESCROW_ABI,
      functionName: "createJob",
      args: [freelancerAddress, `${title} | ${description}`],
    });
    const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createHash });

    // Read the jobId back from the JobCreated event log (topics[1] = jobId)
    const jobLog = createReceipt.logs[0] as unknown as { topics: `0x${string}`[] };
    const jobId = BigInt(jobLog.topics[1]).toString();

    // 2. Fund the job in the same flow, locking `budget` ETH in escrow
    const fundHash = await client.writeContract({
      chain: giwaSepolia,
      account: client.account!,
      address: GIWAGUARD_ESCROW_ADDRESS,
      abi: GIWAGUARD_ESCROW_ABI,
      functionName: "fund",
      args: [BigInt(jobId)],
      value: parseEther(String(budget || "0")),
    });
    await publicClient.waitForTransactionReceipt({ hash: fundHash });

    const supabase = getSupabase();
    await supabase.from("jobs").insert({
      title, description, budget: Number(budget), duration, skills,
      status: "open", job_id_onchain: jobId, tx_hash: createHash,
    });

    return NextResponse.json({
      success: true,
      jobId,
      txHash: createHash,
      explorer: explorerTxUrl(createHash),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("jobs").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, jobs: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
