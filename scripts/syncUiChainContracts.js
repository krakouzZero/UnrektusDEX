const fs = require("fs");
const path = require("path");
require("dotenv").config();

function fail(message) {
  console.error(message);
  process.exit(1);
}

function copyIfExists(src, dest) {
  if (!src || !fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

function normalizeUiMerklePath(rawPath) {
  if (!rawPath) return "";
  const cleaned = String(rawPath).replace(/^[/\\]+/, "");
  const base = path.basename(cleaned);
  if (!base) return "";
  return path.join("merkle", base).replace(/\\/g, "/");
}

function main() {
  const chainKey = process.argv[2] || "dogechain";
  const root = process.cwd();
  const chainsPath = path.join(root, "ui", "chains.json");
  const deploymentPath = path.join(root, "deployments", `${chainKey}.json`);

  if (!fs.existsSync(chainsPath)) {
    fail(`Missing ${chainsPath}`);
  }
  if (!fs.existsSync(deploymentPath)) {
    fail(`Missing ${deploymentPath}. Run deploy script on ${chainKey} first.`);
  }

  const chains = JSON.parse(fs.readFileSync(chainsPath, "utf8"));
  if (!chains.chains || !chains.chains[chainKey]) {
    fail(`Chain '${chainKey}' not found in ui/chains.json`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const chain = chains.chains[chainKey];
  const tokenA =
    deployment.tokenA ||
    process.env.DOGECHAIN_TOKEN_A ||
    (chain.contracts && chain.contracts.tokenA) ||
    "";

  chain.contracts = {
    router: deployment.router || "",
    factory: deployment.factory || "",
    weth: deployment.weth || "",
    tokenA,
    claim: deployment.claim || (chain.contracts && chain.contracts.claim) || ""
  };
  chain.claimMerkleFile = deployment.claimMerkleFile || chain.claimMerkleFile || "";
  chain.claimProofsFile = deployment.claimProofsFile || chain.claimProofsFile || "";

  const claimMerkleFileAbs = chain.claimMerkleFile
    ? path.resolve(root, String(chain.claimMerkleFile).replace(/^[/\\]+/, ""))
    : "";
  const claimProofsFileAbs = chain.claimProofsFile
    ? path.resolve(root, String(chain.claimProofsFile).replace(/^[/\\]+/, ""))
    : "";

  if (claimMerkleFileAbs) {
    const uiMerklePath = normalizeUiMerklePath(chain.claimMerkleFile);
    if (uiMerklePath) {
      const copiedMerkle = copyIfExists(claimMerkleFileAbs, path.join(root, "ui", uiMerklePath));
      if (copiedMerkle) chain.claimMerkleFile = uiMerklePath;
      else console.warn(`Warning: merkle file not found, not copied: ${claimMerkleFileAbs}`);
    }
  }
  if (claimProofsFileAbs) {
    const uiProofsPath = normalizeUiMerklePath(chain.claimProofsFile);
    if (uiProofsPath) {
      const copiedProofs = copyIfExists(claimProofsFileAbs, path.join(root, "ui", uiProofsPath));
      if (copiedProofs) chain.claimProofsFile = uiProofsPath;
      else console.warn(`Warning: proofs file not found, not copied: ${claimProofsFileAbs}`);
    }
  }

  if (!chain.contracts.router || !chain.contracts.factory || !chain.contracts.weth) {
    fail(`Deployment file ${deploymentPath} is missing router/factory/weth`);
  }

  if (!chain.contracts.tokenA) {
    console.warn(
      "Warning: tokenA is empty. Set DOGECHAIN_TOKEN_A in .env then rerun sync for full swap UI."
    );
  }

  fs.writeFileSync(chainsPath, JSON.stringify(chains, null, 2) + "\n", "utf8");

  console.log(`Updated ui/chains.json for ${chainKey}`);
  console.log(`router:  ${chain.contracts.router}`);
  console.log(`factory: ${chain.contracts.factory}`);
  console.log(`weth:    ${chain.contracts.weth}`);
  console.log(`tokenA:  ${chain.contracts.tokenA || "(empty)"}`);
  console.log(`claim:   ${chain.contracts.claim || "(empty)"}`);
  console.log(`proofs:  ${chain.claimProofsFile || "(empty)"}`);
}

main();
