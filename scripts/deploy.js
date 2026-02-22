const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const { ethers } = hre;
  const [deployer] = await ethers.getSigners();
  const feeToSetter = process.env.FEE_TO_SETTER || deployer.address;

  console.log("Deployer:", deployer.address);
  console.log("FeeToSetter:", feeToSetter);

  const WETH = await ethers.getContractFactory("WETH9");
  const weth = await WETH.deploy();
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();

  const Factory = await ethers.getContractFactory("WojakFactory");
  const factory = await Factory.deploy(feeToSetter);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  const Router = await ethers.getContractFactory("WojakRouter02");
  const router = await Router.deploy(factoryAddress, wethAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();

  console.log("WETH9:", wethAddress);
  console.log("WojakFactory:", factoryAddress);
  console.log("WojakRouter02:", routerAddress);

  const networkName = hre.network.name;
  const deploymentsDir = path.join(process.cwd(), "deployments");
  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(
      {
        network: networkName,
        deployer: deployer.address,
        feeToSetter,
        weth: wethAddress,
        factory: factoryAddress,
        router: routerAddress
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
  console.log("Deployment file:", deploymentFile);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
