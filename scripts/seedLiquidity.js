const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)"
];

const ROUTER_ABI = [
  "function addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountETHMin,address to,uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)"
];

function loadDeployment(networkName) {
  const deploymentFile = path.join(process.cwd(), "deployments", `${networkName}.json`);
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Missing ${deploymentFile}. Run deploy:local first.`);
  }
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  return { deployment, deploymentFile };
}

async function assertContract(ethers, address, label) {
  const code = await ethers.provider.getCode(address);
  if (code === "0x") {
    throw new Error(`${label} has no code at ${address}. Re-run deploy/pair on the current node.`);
  }
}

async function main() {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();
  const { deployment, deploymentFile } = loadDeployment(network.name);

  if (!deployment.router || !deployment.factory || !deployment.weth || !deployment.tokenA) {
    throw new Error(
      `Missing router/factory/weth/tokenA in ${deploymentFile}. Run deploy:local then pair:local.`
    );
  }

  await assertContract(ethers, deployment.router, "Router");
  await assertContract(ethers, deployment.factory, "Factory");
  await assertContract(ethers, deployment.weth, "WETH");
  await assertContract(ethers, deployment.tokenA, "TokenA");

  const tokenAmount = ethers.parseEther(process.env.SEED_TOKEN_AMOUNT || "1000000");
  const ethAmount = ethers.parseEther(process.env.SEED_ETH_AMOUNT || "10");

  const token = new ethers.Contract(deployment.tokenA, ERC20_ABI, deployer);
  const router = new ethers.Contract(deployment.router, ROUTER_ABI, deployer);
  const factory = new ethers.Contract(deployment.factory, FACTORY_ABI, deployer);

  await (await token.approve(deployment.router, ethers.MaxUint256)).wait();

  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  const tx = await router.addLiquidityETH(
    deployment.tokenA,
    tokenAmount,
    0,
    0,
    deployer.address,
    deadline,
    { value: ethAmount }
  );
  await tx.wait();

  const pairAddress = await factory.getPair(deployment.tokenA, deployment.weth);

  console.log("Deployer:", deployer.address);
  console.log("uREKT:", deployment.tokenA);
  console.log("WETH:", deployment.weth);
  console.log("Router:", deployment.router);
  console.log("Pair uREKT/WETH:", pairAddress);
  console.log("Seed token amount:", ethers.formatEther(tokenAmount));
  console.log("Seed ETH amount:", ethers.formatEther(ethAmount));
  console.log("Tx:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
