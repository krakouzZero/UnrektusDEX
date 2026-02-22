const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

function readDeployment(networkName) {
  const file = path.join(process.cwd(), "deployments", `${networkName}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function main() {
  const networkName = hre.network.name;
  const deployment = readDeployment(networkName);

  const address = process.env.VERIFY_ADDRESS || deployment.tokenA;
  const router = process.env.VERIFY_ROUTER || deployment.router;
  if (!address) throw new Error("Missing token address (VERIFY_ADDRESS or deployments tokenA)");
  if (!router) throw new Error("Missing constructor router (VERIFY_ROUTER or deployments router)");

  console.log("Network:", networkName);
  console.log("Contract:", address);
  console.log("Constructor router:", router);

  try {
    await hre.run("verify:verify", {
      address,
      contract: "contracts/urekt/Unrektus.sol:Unrektus",
      constructorArguments: [router]
    });
    console.log("Verify success");
  } catch (error) {
    const msg = String(error && error.message ? error.message : error);
    if (msg.toLowerCase().includes("already verified")) {
      console.log("Already verified");
      return;
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
