const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

function normalizeAddress(addr) {
  return ethers.utils.getAddress(addr);
}

function addBalance(map, addr, delta) {
  const prev = map.get(addr) || ethers.constants.Zero;
  const next = prev.add(delta);
  map.set(addr, next);
}

async function main() {
  const rpcUrl = process.env.SNAPSHOT_RPC_URL || process.env.DOGECHAIN_RPC_URL || process.env.RPC_URL;
  const tokenAddress = process.env.SNAPSHOT_TOKEN_ADDRESS || process.env.DOGECHAIN_TOKEN_A;
  const startBlock = Number(process.env.SNAPSHOT_START_BLOCK || 0);
  const chunkSize = Number(process.env.SNAPSHOT_CHUNK || 5000);
  const outDir = path.join(process.cwd(), "snapshots");
  fs.mkdirSync(outDir, { recursive: true });

  if (!rpcUrl) throw new Error("Set SNAPSHOT_RPC_URL or DOGECHAIN_RPC_URL");
  if (!tokenAddress) throw new Error("Set SNAPSHOT_TOKEN_ADDRESS or DOGECHAIN_TOKEN_A");

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const snapshotBlock = process.env.SNAPSHOT_BLOCK
    ? Number(process.env.SNAPSHOT_BLOCK)
    : await provider.getBlockNumber();

  const iface = new ethers.utils.Interface(ERC20_ABI);
  const transferTopic = iface.getEventTopic("Transfer");
  const balances = new Map();
  const zero = ethers.constants.AddressZero;

  for (let fromBlock = startBlock; fromBlock <= snapshotBlock; fromBlock += chunkSize) {
    const toBlock = Math.min(snapshotBlock, fromBlock + chunkSize - 1);
    const logs = await provider.getLogs({
      address: tokenAddress,
      fromBlock,
      toBlock,
      topics: [transferTopic]
    });

    for (const log of logs) {
      const parsed = iface.parseLog(log);
      const from = normalizeAddress(parsed.args.from);
      const to = normalizeAddress(parsed.args.to);
      const value = parsed.args.value;

      if (from !== zero) addBalance(balances, from, value.mul(-1));
      if (to !== zero) addBalance(balances, to, value);
    }
  }

  const decimals = await token.decimals().catch(() => 18);
  const symbol = await token.symbol().catch(() => "TOKEN");
  const claims = [];

  for (const [address, balance] of balances.entries()) {
    if (balance.gt(0)) {
      claims.push({
        address,
        amount: balance.toString(),
        amountFormatted: ethers.utils.formatUnits(balance, decimals)
      });
    }
  }

  claims.sort((a, b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()));
  const total = claims.reduce((acc, c) => acc.add(c.amount), ethers.constants.Zero);
  const outFile = path.join(outDir, `snapshot-${symbol}-${snapshotBlock}.json`);

  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        token: normalizeAddress(tokenAddress),
        symbol,
        decimals,
        snapshotBlock,
        startBlock,
        totalHolders: claims.length,
        totalAmount: total.toString(),
        totalAmountFormatted: ethers.utils.formatUnits(total, decimals),
        claims
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  console.log("Snapshot saved:", outFile);
  console.log("Holders:", claims.length);
  console.log("Total:", ethers.utils.formatUnits(total, decimals), symbol);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
