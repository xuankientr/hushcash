// Unlink private transfer integration
// Install: npm install @unlink-xyz/sdk@canary
// Docs: https://docs.unlink.xyz

const UNLINK_ENV = process.env.UNLINK_ENVIRONMENT ?? "arc-testnet";
const UNLINK_API_KEY = process.env.UNLINK_API_KEY ?? "";
// USDC token address on Arc Testnet via Unlink — fill after checking dashboard
const USDC_TOKEN = process.env.UNLINK_USDC_TOKEN ?? "";

function getAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createUnlinkAdmin } = require("@unlink-xyz/sdk/admin");
  return createUnlinkAdmin({ environment: UNLINK_ENV, apiKey: UNLINK_API_KEY });
}

async function buildClient(mnemonic: string) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { account, createUnlinkClient } = require("@unlink-xyz/sdk/client");
  const admin = getAdmin();

  const unlinkAccount = account.fromMnemonic({ mnemonic });
  const unlinkAddress: string = await unlinkAccount.getAddress();

  const client = createUnlinkClient({
    environment: UNLINK_ENV,
    account: unlinkAccount,
    register: (payload: unknown) => admin.users.register(payload),
    authorizationToken: {
      provider: () => admin.authorizationTokens.issue({ unlinkAddress }),
    },
  });

  await client.ensureRegistered();
  return { client, unlinkAddress };
}

/** Generate a fresh BIP39 mnemonic for a new user Unlink account */
export function generateMnemonic(): string {
  // Use ethers v6 which is pulled in by Unlink SDK
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Wallet } = require("ethers");
  return Wallet.createRandom().mnemonic.phrase as string;
}

/** Get the unlink1... address for a mnemonic (used to register new user) */
export async function getUnlinkAddress(mnemonic: string): Promise<string> {
  const { unlinkAddress } = await buildClient(mnemonic);
  return unlinkAddress;
}

/** Private transfer between two HushCash users via Unlink ZK pool */
export async function privateTransfer({
  senderMnemonic,
  recipientUnlinkAddress,
  amountUsdc,
}: {
  senderMnemonic: string;
  recipientUnlinkAddress: string;
  amountUsdc: string;
}): Promise<{ txId: string }> {
  const { client } = await buildClient(senderMnemonic);
  // USDC has 6 decimals
  const amount = String(Math.round(parseFloat(amountUsdc) * 1_000_000));
  const tx = await client.transfer({
    recipientAddress: recipientUnlinkAddress,
    token: USDC_TOKEN,
    amount,
  });
  const confirmed = await tx.wait();
  return { txId: confirmed?.id ?? confirmed?.txHash ?? "unknown" };
}

/** Deposit from Circle DCW → Unlink private pool */
export async function depositToUnlink({
  mnemonic,
  amountUsdc,
}: {
  mnemonic: string;
  amountUsdc: string;
}): Promise<void> {
  const { client } = await buildClient(mnemonic);
  const amount = String(Math.round(parseFloat(amountUsdc) * 1_000_000));
  const tx = await client.depositWithApproval({ token: USDC_TOKEN, amount });
  await tx.wait();
}

/** Get private USDC balance in Unlink pool */
export async function getPrivateBalance(mnemonic: string): Promise<string> {
  const { client } = await buildClient(mnemonic);
  const { balances } = await client.getBalances();
  const usdc = (balances as { token: string; amount: string }[]).find(
    (b) => b.token === USDC_TOKEN
  );
  // Convert from 6 decimals back to human-readable
  const raw = usdc?.amount ?? "0";
  return (parseInt(raw) / 1_000_000).toFixed(2);
}
