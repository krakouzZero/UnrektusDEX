const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function main() {
  const rpcUrl = process.env.SNAPSHOT_RPC_URL || process.env.DOGECHAIN_RPC_URL || process.env.RPC_URL;
  const tokenAddress = process.env.SNAPSHOT_TOKEN_ADDRESS || process.env.DOGECHAIN_TOKEN_A;
  const wallet = process.env.SNAPSHOT_WALLET;

  if (!rpcUrl) throw new Error("Set SNAPSHOT_RPC_URL or DOGECHAIN_RPC_URL");
  if (!tokenAddress) throw new Error("Set SNAPSHOT_TOKEN_ADDRESS or DOGECHAIN_TOKEN_A");
  if (!wallet) throw new Error("Set SNAPSHOT_WALLET");

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const snapshotBlock = process.env.SNAPSHOT_BLOCK
    ? Number(process.env.SNAPSHOT_BLOCK)
    : await provider.getBlockNumber();

  const walletAddress = ethers.utils.getAddress(wallet);
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  const [decimals, symbol, balance] = await Promise.all([
    token.decimals().catch(() => 18),
    token.symbol().catch(() => "TOKEN"),
    token.balanceOf(walletAddress, { blockTag: snapshotBlock })
  ]);

  if (balance.lte(0)) {
    throw new Error(`Balance is zero at block ${snapshotBlock} for ${walletAddress}`);
  }

  const outDir = path.join(process.cwd(), "snapshots");
  fs.mkdirSync(outDir, { recursive: true });

  const shortWallet = walletAddress.slice(2, 8).toLowerCase();
  const outFile = path.join(outDir, `snapshot-${symbol}-${snapshotBlock}-${shortWallet}.json`);
  const amount = balance.toString();

  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        token: ethers.utils.getAddress(tokenAddress),
        symbol,
        decimals,
        snapshotBlock,
        totalHolders: 1,
        totalAmount: amount,
        totalAmountFormatted: ethers.utils.formatUnits(balance, decimals),
        claims: [
          {
            address: walletAddress,
            amount,
            amountFormatted: ethers.utils.formatUnits(balance, decimals)
          }
        ]
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  console.log("Snapshot wallet file:", outFile);
  console.log("Wallet:", walletAddress);
  console.log("Block:", snapshotBlock);
  console.log("Amount raw:", amount);
  console.log("Amount:", ethers.utils.formatUnits(balance, decimals), symbol);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
