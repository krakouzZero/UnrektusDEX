const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

function getDeployment(networkName) {
  const deploymentFile = path.join(process.cwd(), "deployments", `${networkName}.json`);
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Missing ${deploymentFile}. Run deploy first.`);
  }
  return {
    deploymentFile,
    data: JSON.parse(fs.readFileSync(deploymentFile, "utf8"))
  };
}

function resolveTokenA(deployment) {
  return process.env.TOKEN_A_ADDRESS || process.env.DOGECHAIN_TOKEN_A || deployment.tokenA || "";
}

async function main() {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();

  const { deploymentFile, data: deployment } = getDeployment(network.name);
  const tokenA = resolveTokenA(deployment);
  if (!tokenA) {
    throw new Error("Set TOKEN_A_ADDRESS or DOGECHAIN_TOKEN_A in .env");
  }
  if (!deployment.factory || !deployment.weth) {
    throw new Error(`Missing factory/weth in ${deploymentFile}.`);
  }

  const factoryAbi = [
    "function getPair(address tokenA,address tokenB) external view returns (address pair)",
    "function createPair(address tokenA,address tokenB) external returns (address pair)"
  ];
  const factory = new ethers.Contract(deployment.factory, factoryAbi, deployer);
  let pair = await factory.getPair(tokenA, deployment.weth);

  if (pair === ethers.ZeroAddress) {
    const tx = await factory.createPair(tokenA, deployment.weth);
    await tx.wait();
    pair = await factory.getPair(tokenA, deployment.weth);
    console.log("createPair tx:", tx.hash);
  } else {
    console.log("Pair already exists:", pair);
  }

  const next = {
    ...deployment,
    tokenA,
    pair
  };
  fs.writeFileSync(deploymentFile, JSON.stringify(next, null, 2) + "\n", "utf8");

  console.log("Deployer:", deployer.address);
  console.log("Factory:", deployment.factory);
  console.log("WETH (wrapped native):", deployment.weth);
  console.log("TokenA:", tokenA);
  console.log("Pair:", pair);
  console.log("Updated:", deploymentFile);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
