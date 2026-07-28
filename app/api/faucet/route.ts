import { NextResponse } from "next/server";

// GiwaGuard doesn't run its own faucet wallet. GIWA already provides official
// testnet ETH faucets, so this endpoint just returns their info for the UI.
export async function GET() {
  return NextResponse.json({
    success: true,
    faucets: [
      { name: "GIWA Faucet", url: "https://docs.giwa.io/get-started/faucets", limit: "0.005 ETH / 24h" },
      { name: "Nodit Faucet", url: "https://docs.giwa.io/get-started/faucets", limit: "0.01 ETH / 24h" },
    ],
  });
}
