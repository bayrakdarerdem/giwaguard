import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { publicClient, getWalletClient, explorerTxUrl, giwaSepolia } from "@/lib/giwa";
import { GIWAGUARD_ESCROW_ADDRESS, GIWAGUARD_ESCROW_ABI } from "@/lib/contract";

export async function POST(req: NextRequest) {
  try {
    const { job_id, deliverable } = await req.json();
    const freelancer = getWalletClient("FREELANCER_PRIVATE_KEY");

    const hash = await freelancer.writeContract({
      chain: giwaSepolia,
      account: freelancer.account!,
      address: GIWAGUARD_ESCROW_ADDRESS,
      abi: GIWAGUARD_ESCROW_ABI,
      functionName: "submit",
      args: [BigInt(job_id), deliverable || "Deliverable submitted"],
    });
    await publicClient.waitForTransactionReceipt({ hash });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.from("jobs").update({ status: "submitted" }).eq("job_id_onchain", job_id);

    return NextResponse.json({ success: true, txHash: hash, explorer: explorerTxUrl(hash) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
