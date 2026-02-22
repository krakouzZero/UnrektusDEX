const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

function loadMerkleFile() {
  const file = process.env.MERKLE_FILE;
  if (!file) throw new Error("Set MERKLE_FILE=merkle/xxx-merkle.json");
  const fullPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) throw new Error(`Merkle file not found: ${fullPath}`);
  return {
    path: fullPath,
    data: JSON.parse(fs.readFileSync(fullPath, "utf8"))
  };
}

async function main() {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();
  const owner = process.env.CLAIM_OWNER || deployer.address;

  const { path: merklePath, data: merkle } = loadMerkleFile();
  const proofsPath = merklePath.replace(/-merkle\.json$/i, "-proofs.json");
  const token = process.env.CLAIM_TOKEN_ADDRESS || merkle.token || process.env.DOGECHAIN_NEW_TOKEN;
  if (!token) throw new Error("Set CLAIM_TOKEN_ADDRESS or include token in MERKLE_FILE");
  const totalClaimable = merkle.totalAmount;
  if (!totalClaimable) throw new Error("Merkle file missing totalAmount. Re-run buildMerkleClaims.");

  const nowTs = Math.floor(Date.now() / 1000);
  const claimEnd = process.env.CLAIM_DEADLINE_TS
    ? Number(process.env.CLAIM_DEADLINE_TS)
    : nowTs + 60 * 60 * 24 * 60;

  const Claim = await ethers.getContractFactory("MerkleClaim");
  const claim = await Claim.deploy(token, merkle.merkleRoot, claimEnd, owner, totalClaimable);
  await claim.waitForDeployment();
  const claimAddress = await claim.getAddress();

  const deploymentFile = path.join(process.cwd(), "deployments", `${network.name}.json`);
  const existing = fs.existsSync(deploymentFile)
    ? JSON.parse(fs.readFileSync(deploymentFile, "utf8"))
    : { network: network.name };
  const next = {
    ...existing,
    claim: claimAddress,
    claimRoot: merkle.merkleRoot,
    claimToken: token,
    claimTotalAmount: totalClaimable,
    claimDeadline: claimEnd,
    claimMerkleFile: path.relative(process.cwd(), merklePath),
    claimProofsFile: fs.existsSync(proofsPath) ? path.relative(process.cwd(), proofsPath) : ""
  };
  fs.mkdirSync(path.dirname(deploymentFile), { recursive: true });
  fs.writeFileSync(deploymentFile, JSON.stringify(next, null, 2) + "\n", "utf8");

  console.log("Deployer:", deployer.address);
  console.log("Owner:", owner);
  console.log("Token:", token);
  console.log("Merkle Root:", merkle.merkleRoot);
  console.log("Total claimable:", totalClaimable);
  console.log("Claim End:", claimEnd);
  console.log("MerkleClaim:", claimAddress);
  console.log("Updated:", deploymentFile);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
