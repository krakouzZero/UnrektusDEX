const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
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
    throw new Error(`${label} has no code at ${address}. Re-run deploy/pair/seed on the current node.`);
  }
}

async function main() {
  const { ethers, network } = hre;
  const [deployer, trader] = await ethers.getSigners();
  const { deployment, deploymentFile } = loadDeployment(network.name);

  if (!deployment.router || !deployment.weth || !deployment.tokenA) {
    throw new Error(
      `Missing router/weth/tokenA in ${deploymentFile}. Run deploy:local then pair:local.`
    );
  }

  await assertContract(ethers, deployment.router, "Router");
  await assertContract(ethers, deployment.weth, "WETH");
  await assertContract(ethers, deployment.tokenA, "TokenA");

  const amountIn = ethers.parseEther(process.env.SWAP_TOKEN_IN || "1000");
  const token = new ethers.Contract(deployment.tokenA, ERC20_ABI, deployer);
  const routerTrader = new ethers.Contract(deployment.router, ROUTER_ABI, trader);
  const tokenTrader = new ethers.Contract(deployment.tokenA, ERC20_ABI, trader);

  await (await token.transfer(trader.address, amountIn)).wait();
  await (await tokenTrader.approve(deployment.router, amountIn)).wait();

  const pathTokens = [deployment.tokenA, deployment.weth];
  const quote = await routerTrader.getAmountsOut(amountIn, pathTokens);
  const amountOutMin = (quote[1] * 99n) / 100n;
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  const ethBefore = await ethers.provider.getBalance(trader.address);
  const tokenBefore = await tokenTrader.balanceOf(trader.address);

  const tx = await routerTrader.swapExactTokensForETH(
    amountIn,
    amountOutMin,
    pathTokens,
    trader.address,
    deadline
  );
  const receipt = await tx.wait();

  const gasPrice = receipt.gasPrice ?? tx.gasPrice ?? 0n;
  const gasCost = receipt.gasUsed * gasPrice;
  const ethAfter = await ethers.provider.getBalance(trader.address);
  const tokenAfter = await tokenTrader.balanceOf(trader.address);

  console.log("Trader:", trader.address);
  console.log("Amount in (uREKT):", ethers.formatEther(amountIn));
  console.log("Quoted out (ETH):", ethers.formatEther(quote[1]));
  console.log("Min out (ETH):", ethers.formatEther(amountOutMin));
  console.log("ETH before:", ethers.formatEther(ethBefore));
  console.log("ETH after:", ethers.formatEther(ethAfter));
  console.log("ETH delta (net gas):", ethers.formatEther(ethAfter - ethBefore));
  console.log("ETH delta (gross):", ethers.formatEther(ethAfter - ethBefore + gasCost));
  console.log("uREKT before:", ethers.formatEther(tokenBefore));
  console.log("uREKT after:", ethers.formatEther(tokenAfter));
  console.log("Tx:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
