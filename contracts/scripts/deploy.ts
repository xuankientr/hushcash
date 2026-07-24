import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Deployer :", deployer.address);
  console.log("Balance  :", ethers.formatEther(balance), "USDC");
  console.log("");

  // Deploy DropCashEscrow
  const EscrowFactory = await ethers.getContractFactory("DropCashEscrow");
  const escrow = await EscrowFactory.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("✓ DropCashEscrow  :", escrowAddress);
  console.log("  Explorer        :", `https://testnet.arcscan.app/address/${escrowAddress}`);

  // Deploy InvoiceRegistry
  const RegistryFactory = await ethers.getContractFactory("InvoiceRegistry");
  const registry = await RegistryFactory.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("\n✓ InvoiceRegistry :", registryAddress);
  console.log("  Explorer        :", `https://testnet.arcscan.app/address/${registryAddress}`);

  console.log("\n--- Add to .env ---");
  console.log(`NEXT_PUBLIC_ESCROW_ADDRESS=${escrowAddress}`);
  console.log(`NEXT_PUBLIC_INVOICE_REGISTRY_ADDRESS=${registryAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});