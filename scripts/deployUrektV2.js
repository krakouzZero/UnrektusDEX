const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

function readDeployment(networkName) {
  const file = path.join(process.cwd(), "deployments", `${networkName}.json`);
  if (!fs.existsSync(file)) {
    return { file, data: { network: networkName } };
  }
  return {
    file,
    data: JSON.parse(fs.readFileSync(file, "utf8"))
  };
}

async function main() {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();
  const { file, data } = readDeployment(network.name);

  const routerAddress = process.env.UREKT_ROUTER_ADDRESS || data.router;
  if (!routerAddress) {
    throw new Error(
      `Router missing. Set UREKT_ROUTER_ADDRESS or deploy DEX first to populate deployments/${network.name}.json`
    );
  }

  const Unrektus = await ethers.getContractFactory("Unrektus");
  const token = await Unrektus.deploy(routerAddress);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  const tokenName = await token.name();
  const tokenSymbol = await token.symbol();
  const pairAddress = await token.getPair();

  const updated = {
    ...data,
    network: network.name,
    deployer: deployer.address,
    router: routerAddress,
    tokenA: tokenAddress,
    tokenASymbol: tokenSymbol,
    tokenAName: tokenName,
    pair: pairAddress
  };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(updated, null, 2) + "\n", "utf8");

  console.log("Deployer:", deployer.address);
  console.log("Router:", routerAddress);
  console.log("uREKT:", tokenAddress);
  console.log("Pair:", pairAddress);
  console.log("Updated:", file);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
