const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();

function hashLeaf(address, amount) {
  return ethers.utils.solidityKeccak256(["address", "uint256"], [address, amount]);
}

function hashPair(a, b) {
  return a.toLowerCase() < b.toLowerCase()
    ? ethers.utils.keccak256(ethers.utils.concat([a, b]))
    : ethers.utils.keccak256(ethers.utils.concat([b, a]));
}

function buildTree(leaves) {
  const levels = [leaves];
  while (levels[levels.length - 1].length > 1) {
    const prev = levels[levels.length - 1];
    const next = [];
    for (let i = 0; i < prev.length; i += 2) {
      const left = prev[i];
      const right = i + 1 < prev.length ? prev[i + 1] : prev[i];
      next.push(hashPair(left, right));
    }
    levels.push(next);
  }
  return levels;
}

function getProof(levels, index) {
  const proof = [];
  for (let level = 0; level < levels.length - 1; level++) {
    const nodes = levels[level];
    const sibling = index ^ 1;
    proof.push(nodes[sibling] || nodes[index]);
    index = Math.floor(index / 2);
  }
  return proof;
}

async function main() {
  const inputFile = process.env.SNAPSHOT_FILE;
  if (!inputFile) {
    throw new Error("Set SNAPSHOT_FILE=path/to/snapshot.json");
  }
  const inPath = path.isAbsolute(inputFile) ? inputFile : path.join(process.cwd(), inputFile);
  if (!fs.existsSync(inPath)) {
    throw new Error(`Snapshot file not found: ${inPath}`);
  }

  const snapshot = JSON.parse(fs.readFileSync(inPath, "utf8"));
  if (!Array.isArray(snapshot.claims) || snapshot.claims.length === 0) {
    throw new Error("Snapshot has no claims");
  }

  const claims = snapshot.claims
    .map((c) => ({
      address: ethers.utils.getAddress(c.address),
      amount: ethers.BigNumber.from(c.amount).toString()
    }))
    .sort((a, b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()));

  const totalAmount = claims
    .reduce((acc, c) => acc.add(ethers.BigNumber.from(c.amount)), ethers.BigNumber.from(0))
    .toString();

  const leaves = claims.map((c) => hashLeaf(c.address, c.amount));
  const levels = buildTree(leaves);
  const merkleRoot = levels[levels.length - 1][0];
  const outputClaims = claims.map((c, i) => ({
    ...c,
    proof: getProof(levels, i)
  }));

  const outDir = path.join(process.cwd(), "merkle");
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.basename(inPath).replace(/\.json$/i, "");
  const outFile = path.join(outDir, `${base}-merkle.json`);
  const proofsFile = path.join(outDir, `${base}-proofs.json`);

  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        token: snapshot.token,
        symbol: snapshot.symbol,
        decimals: snapshot.decimals,
        snapshotBlock: snapshot.snapshotBlock,
        merkleRoot,
        totalAmount,
        totalClaims: outputClaims.length,
        claims: outputClaims
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  const proofsByAddress = {};
  for (const row of outputClaims) {
    proofsByAddress[row.address.toLowerCase()] = {
      amount: row.amount,
      proof: row.proof
    };
  }

  fs.writeFileSync(
    proofsFile,
    JSON.stringify(
      {
        token: snapshot.token,
        symbol: snapshot.symbol,
        decimals: snapshot.decimals,
        snapshotBlock: snapshot.snapshotBlock,
        merkleRoot,
        totalAmount,
        totalClaims: outputClaims.length,
        proofsByAddress
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  console.log("Merkle file:", outFile);
  console.log("Proofs file:", proofsFile);
  console.log("Root:", merkleRoot);
  console.log("Claims:", outputClaims.length);
  console.log("Total amount:", totalAmount);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
