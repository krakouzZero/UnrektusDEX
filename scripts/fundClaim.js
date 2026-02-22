const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const ERC20_ABI = ["function transfer(address to, uint256 amount) external returns (bool)"];

function loadDeployment(networkName) {
  const file = path.join(process.cwd(), "deployments", `${networkName}.json`);
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function main() {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();
  const deployment = loadDeployment(network.name);

  const claimAddress = process.env.CLAIM_ADDRESS || deployment.claim;
  const tokenAddress = process.env.CLAIM_TOKEN_ADDRESS || deployment.claimToken || deployment.tokenA;
  const amountRaw = process.env.CLAIM_FUND_AMOUNT;

  if (!claimAddress) throw new Error("Set CLAIM_ADDRESS or deploy claim first");
  if (!tokenAddress) throw new Error("Set CLAIM_TOKEN_ADDRESS");
  if (!amountRaw) throw new Error("Set CLAIM_FUND_AMOUNT (raw integer units)");

  const token = new ethers.Contract(tokenAddress, ERC20_ABI, deployer);
  const tx = await token.transfer(claimAddress, amountRaw);
  await tx.wait();

  console.log("From:", deployer.address);
  console.log("Token:", tokenAddress);
  console.log("Claim:", claimAddress);
  console.log("Amount (raw):", amountRaw);
  console.log("Tx:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
