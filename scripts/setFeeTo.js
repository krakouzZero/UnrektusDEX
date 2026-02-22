const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const FACTORY_ABI = [
  "function feeTo() external view returns (address)",
  "function feeToSetter() external view returns (address)",
  "function setFeeTo(address) external"
];

function loadDeployment(networkName) {
  const file = path.join(process.cwd(), "deployments", `${networkName}.json`);
  if (!fs.existsSync(file)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function main() {
  const { ethers, network } = hre;
  const [signer] = await ethers.getSigners();

  const deployment = loadDeployment(network.name);
  const factoryAddress = process.env.FACTORY_ADDRESS || deployment?.factory;
  const feeToRaw = process.env.FEE_TO_ADDRESS;

  if (!factoryAddress) throw new Error("Set FACTORY_ADDRESS or deploy first");
  if (!feeToRaw) throw new Error("Set FEE_TO_ADDRESS");
  let feeTo;
  try {
    feeTo = ethers.getAddress ? ethers.getAddress(feeToRaw) : ethers.utils.getAddress(feeToRaw);
  } catch (_) {
    throw new Error("FEE_TO_ADDRESS invalid");
  }

  const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer);
  const [beforeFeeTo, feeToSetter] = await Promise.all([factory.feeTo(), factory.feeToSetter()]);

  console.log("Network:", network.name);
  console.log("Signer:", signer.address);
  console.log("Factory:", factoryAddress);
  console.log("feeToSetter:", feeToSetter);
  console.log("feeTo (before):", beforeFeeTo);

  if (feeToSetter.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error("Signer is not feeToSetter");
  }

  if (beforeFeeTo.toLowerCase() === feeTo.toLowerCase()) {
    console.log("feeTo already set. Nothing to do.");
    return;
  }

  const tx = await factory.setFeeTo(feeTo);
  await tx.wait();
  const afterFeeTo = await factory.feeTo();

  console.log("feeTo (after):", afterFeeTo);
  console.log("Tx:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
