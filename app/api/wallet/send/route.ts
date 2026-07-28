import { NextRequest, NextResponse } from "next/server";
import { parseEther } from "viem";
import { publicClient, getWalletClient, explorerTxUrl, giwaSepolia } from "@/lib/giwa";

export async function POST(req: NextRequest) {
  try {
    const { amount, to } = await req.json();

    if (!to || !to.startsWith("0x")) {
      return NextResponse.json({ success: false, error: "Invalid recipient address" }, { status: 400 });
    }

    const client = getWalletClient("CLIENT_PRIVATE_KEY");
    // Note: viem's sendTransaction overload resolution gets confused between the
    // EIP-4844 (blob) and EIP-1559 transaction types for a generically-typed
    // chain object here, and asks for an unrelated `kzg` field. This has no
    // runtime effect (we never send blob params) so we assert the param type.
    const hash = await client.sendTransaction({
      chain: giwaSepolia,
      account: client.account!,
      to: to as `0x${string}`,
      value: parseEther(String(amount || "0.001")),
      type: "eip1559",
    } as unknown as Parameters<typeof client.sendTransaction>[0]);
    await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({ success: true, txHash: hash, explorer: explorerTxUrl(hash), message: "ETH sent successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
