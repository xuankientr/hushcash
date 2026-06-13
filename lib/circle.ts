import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

let circleClient: ReturnType<typeof initiateDeveloperControlledWalletsClient> | null = null;

function getCircleClient() {
  if (!circleClient) {
    circleClient = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
    });
  }
  return circleClient;
}

export async function createWalletForUser(userId: string) {
  const client = getCircleClient();
  const response = await client.createWallets({
    blockchains: ["ARC-TESTNET"],
    count: 1,
    walletSetId: process.env.CIRCLE_WALLET_SET_ID!,
    metadata: [{ name: `hushcash-${userId}`, refId: userId }],
  });
  return response.data?.wallets?.[0];
}

export async function getWalletBalance(walletId: string) {
  const client = getCircleClient();
  const response = await client.getWalletTokenBalance({ id: walletId });
  const usdcToken = response.data?.tokenBalances?.find(
    (t: { token?: { symbol?: string }; amount?: string }) => t.token?.symbol === "USDC"
  );
  return usdcToken?.amount ?? "0";
}

export async function transferUsdc(params: {
  sourceWalletId: string;
  destinationAddress: string;
  amountUsdc: string;
}) {
  const client = getCircleClient();
  const response = await client.createTransaction({
    walletId: params.sourceWalletId,
    tokenId: "15dc2b5d-0994-58b0-bf8c-3a0501148ee8", // native USDC on Arc Testnet
    destinationAddress: params.destinationAddress,
    amount: [params.amountUsdc],
    fee: { type: "level", config: { feeLevel: "MEDIUM" } },
  });
  return response.data;
}

export async function getTransactionDetails(circleTransferId: string) {
  const client = getCircleClient();
  const response = await client.getTransaction({ id: circleTransferId });
  const tx = response.data?.transaction;
  return { txHash: tx?.txHash ?? null, state: tx?.state ?? null };
}

export async function exportWalletKey(walletId: string) {
  const client = getCircleClient();
  const response = await client.getWallet({ id: walletId });
  return response.data?.wallet;
}

export async function createEscrowWallet(linkId: string) {
  const client = getCircleClient();
  const response = await client.createWallets({
    blockchains: ["ARC-TESTNET"],
    count: 1,
    walletSetId: process.env.CIRCLE_WALLET_SET_ID!,
    metadata: [{ name: `escrow-${linkId}`, refId: linkId }],
  });
  return response.data?.wallets?.[0];
}
