import { createPublicClient, createWalletClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const giwaSepolia = defineChain({
  id: 91342,
  name: "GIWA Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://sepolia-rpc.giwa.io"] },
  },
  blockExplorers: {
    default: { name: "GIWA Explorer", url: "https://sepolia-explorer.giwa.io" },
  },
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: giwaSepolia,
  transport: http(),
});

/**
 * Demo-only helper: returns a viem wallet client for the given env var
 * holding a private key (e.g. CLIENT_PRIVATE_KEY, FREELANCER_PRIVATE_KEY).
 *
 * This mirrors freelance-arc's use of fixed demo wallets (there it was
 * CLIENT_WALLET_ADDRESS / FREELANCER_WALLET_ADDRESS managed by Circle).
 * Here, since GIWA has no Circle Developer Controlled Wallets support,
 * we hold the demo keys directly as env vars. This is fine for a
 * testnet MVP demo; a production version should use real wallet connect
 * (MetaMask / WalletConnect) instead of server-held keys.
 */
export function getWalletClient(envVar: string) {
  const pk = process.env[envVar];
  if (!pk) throw new Error(`Missing env var ${envVar}`);
  const account = privateKeyToAccount(pk as `0x${string}`);
  return createWalletClient({
    account,
    chain: giwaSepolia,
    transport: http(),
  });
}

export function explorerTxUrl(hash: string) {
  return `https://sepolia-explorer.giwa.io/tx/${hash}`;
}
