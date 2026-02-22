const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function getFactoryAddress(networkName) {
  if (process.env.FACTORY_ADDRESS) {
    return process.env.FACTORY_ADDRESS;
  }

  const deploymentFile = path.join(process.cwd(), "deployments", `${networkName}.json`);
  if (!fs.existsSync(deploymentFile)) {
    return null;
  }

  const raw = fs.readFileSync(deploymentFile, "utf8");
  const data = JSON.parse(raw);
  return data.factory || null;
}

function getDeploymentFilePath(networkName) {
  return path.join(process.cwd(), "deployments", `${networkName}.json`);
}

function mergeDeployment(networkName, patch) {
  const deploymentFile = getDeploymentFilePath(networkName);
  const current = fs.existsSync(deploymentFile)
    ? JSON.parse(fs.readFileSync(deploymentFile, "utf8"))
    : { network: networkName };
  const next = { ...current, ...patch };
  fs.mkdirSync(path.dirname(deploymentFile), { recursive: true });
  fs.writeFileSync(deploymentFile, JSON.stringify(next, null, 2) + "\n", "utf8");
  return deploymentFile;
}

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();

  const networkName = hre.network.name;
  const factoryAddress = getFactoryAddress(networkName);
  if (!factoryAddress) {
    throw new Error(
      `Set FACTORY_ADDRESS in .env or run deploy first to create deployments/${networkName}.json`
    );
  }

  const Factory = await ethers.getContractFactory("WojakFactory");
  const factory = Factory.attach(factoryAddress);

  const Token = await ethers.getContractFactory("MockERC20");
  const initialSupply = ethers.parseEther("1000000000");

  const tokenA = await Token.deploy("uREKT", "uREKT", initialSupply);
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();

  const tokenB = await Token.deploy("WJACK", "WJACK", initialSupply);
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();

  const tx = await factory.createPair(tokenAAddress, tokenBAddress);
  await tx.wait();

  const pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
  const deploymentFile = mergeDeployment(networkName, {
    tokenA: tokenAAddress,
    tokenASymbol: "uREKT",
    tokenB: tokenBAddress,
    tokenBSymbol: "WJACK",
    pair: pairAddress
  });

  console.log("Deployer:", deployer.address);
  console.log("Factory:", factoryAddress);
  console.log("TokenA (uREKT):", tokenAAddress);
  console.log("TokenB (WJACK):", tokenBAddress);
  console.log("Pair:", pairAddress);
  console.log("Deployment file:", deploymentFile);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
