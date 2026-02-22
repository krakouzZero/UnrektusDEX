const http = require("http");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const PORT = Number(process.env.UI_PORT || 4173);
const ROOT = process.cwd();
const RPC_URL = process.env.UI_RPC_URL || "http://127.0.0.1:8545";
const DEFAULT_LOCAL_PK =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const PRIVATE_KEY = process.env.UI_PRIVATE_KEY || DEFAULT_LOCAL_PK;
const DEPLOYMENT_FILE = path.join(ROOT, "deployments", "localhost.json");
const ACTIVITY_LIMIT = 100;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const activity = [];

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)"
];
const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountETHMin,address to,uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)",
  "function removeLiquidityETH(address token,uint liquidity,uint amountTokenMin,uint amountETHMin,address to,uint deadline) external returns (uint amountToken, uint amountETH)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)"
];
const PAIR_ABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function balanceOf(address owner) external view returns (uint)",
  "function allowance(address owner, address spender) external view returns (uint)",
  "function approve(address spender, uint value) external returns (bool)"
];

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function shortAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function addActivity(type, details) {
  activity.unshift({
    type,
    timestamp: new Date().toISOString(),
    ...details
  });
  if (activity.length > ACTIVITY_LIMIT) {
    activity.length = ACTIVITY_LIMIT;
  }
}

function loadDeployment() {
  if (!fs.existsSync(DEPLOYMENT_FILE)) {
    throw new Error(`Missing ${DEPLOYMENT_FILE}. Run deploy:local then pair:local first.`);
  }
  return JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, "utf8"));
}

async function readBody(req) {
  let data = "";
  for await (const chunk of req) data += chunk;
  if (!data) return {};
  return JSON.parse(data);
}

async function ensureLocalContracts(deployment) {
  const labels = [
    ["router", deployment.router],
    ["factory", deployment.factory],
    ["weth", deployment.weth],
    ["tokenA", deployment.tokenA]
  ];
  for (const [label, addr] of labels) {
    if (!addr) throw new Error(`Missing ${label} in deployments/localhost.json`);
    const code = await provider.getCode(addr);
    if (code === "0x") throw new Error(`${label} has no code at ${addr}. Redeploy on current node.`);
  }
}

function parseAmount(value, fallback) {
  return ethers.utils.parseEther(String(value || fallback));
}

async function getContracts(deployment, signerOrProvider = provider) {
  const factory = new ethers.Contract(deployment.factory, FACTORY_ABI, signerOrProvider);
  const router = new ethers.Contract(deployment.router, ROUTER_ABI, signerOrProvider);
  const tokenA = new ethers.Contract(deployment.tokenA, ERC20_ABI, signerOrProvider);
  return { factory, router, tokenA };
}

async function getPairInfo(deployment, signerOrProvider = provider) {
  const { factory } = await getContracts(deployment, signerOrProvider);
  const pairAddress = await factory.getPair(deployment.tokenA, deployment.weth);
  if (!pairAddress || pairAddress === ethers.constants.AddressZero) {
    return { pairAddress: ethers.constants.AddressZero, reserves: null, pair: null };
  }
  const code = await provider.getCode(pairAddress);
  if (code === "0x") return { pairAddress, reserves: null, pair: null };

  const pair = new ethers.Contract(pairAddress, PAIR_ABI, signerOrProvider);
  const [r, token0, token1] = await Promise.all([pair.getReserves(), pair.token0(), pair.token1()]);
  return {
    pairAddress,
    pair,
    reserves: {
      token0,
      token1,
      reserve0: ethers.utils.formatEther(r.reserve0),
      reserve1: ethers.utils.formatEther(r.reserve1)
    }
  };
}

async function quoteSwap(deployment, amountInRaw) {
  const { router } = await getContracts(deployment, provider);
  const amountIn = parseAmount(amountInRaw, "1000");
  const path = [deployment.tokenA, deployment.weth];
  const amounts = await router.getAmountsOut(amountIn, path);
  return {
    amountIn: ethers.utils.formatEther(amountIn),
    amountOut: ethers.utils.formatEther(amounts[1]),
    path
  };
}

async function getState() {
  const deployment = loadDeployment();
  await ensureLocalContracts(deployment);

  const { tokenA } = await getContracts(deployment, provider);
  const pairInfo = await getPairInfo(deployment, provider);
  const walletEth = await provider.getBalance(wallet.address);
  const walletTokenA = await tokenA.balanceOf(wallet.address);
  let lpBalance = ethers.constants.Zero;
  if (pairInfo.pair) {
    lpBalance = await pairInfo.pair.balanceOf(wallet.address);
  }

  let quote = null;
  try {
    quote = await quoteSwap(deployment, "1000");
  } catch (_) {
    quote = null;
  }

  return {
    network: "localhost",
    rpcUrl: RPC_URL,
    wallet: wallet.address,
    walletShort: shortAddress(wallet.address),
    deployment,
    balances: {
      eth: ethers.utils.formatEther(walletEth),
      uREKT: ethers.utils.formatEther(walletTokenA),
      lp: ethers.utils.formatEther(lpBalance)
    },
    pairAddress: pairInfo.pairAddress,
    reserves: pairInfo.reserves,
    quote1000uREKTtoETH: quote ? quote.amountOut : null,
    blockNumber: await provider.getBlockNumber()
  };
}

async function faucetToken(body) {
  const deployment = loadDeployment();
  await ensureLocalContracts(deployment);
  const { tokenA } = await getContracts(deployment, wallet);
  const amount = parseAmount(body.amount, "10000");
  const tx = await tokenA.mint(wallet.address, amount);
  await tx.wait();
  const result = {
    txHash: tx.hash,
    amount: ethers.utils.formatEther(amount)
  };
  addActivity("faucet", result);
  return result;
}

async function addLiquidity(body) {
  const deployment = loadDeployment();
  await ensureLocalContracts(deployment);

  const { router, tokenA } = await getContracts(deployment, wallet);
  const { factory } = await getContracts(deployment, provider);
  const tokenAmount = parseAmount(body.tokenAmount, "100000");
  const ethAmount = parseAmount(body.ethAmount, "1");

  const allowance = await tokenA.allowance(wallet.address, deployment.router);
  if (allowance.lt(tokenAmount)) {
    const approveTx = await tokenA.approve(deployment.router, ethers.constants.MaxUint256);
    await approveTx.wait();
  }

  const deadline = Math.floor(Date.now() / 1000) + 20 * 60;
  const tx = await router.addLiquidityETH(
    deployment.tokenA,
    tokenAmount,
    0,
    0,
    wallet.address,
    deadline,
    { value: ethAmount }
  );
  await tx.wait();
  const pairAddress = await factory.getPair(deployment.tokenA, deployment.weth);

  const result = {
    txHash: tx.hash,
    pairAddress,
    tokenAmount: ethers.utils.formatEther(tokenAmount),
    ethAmount: ethers.utils.formatEther(ethAmount)
  };
  addActivity("add_liquidity", result);
  return result;
}

async function removeLiquidity(body) {
  const deployment = loadDeployment();
  await ensureLocalContracts(deployment);
  const { router } = await getContracts(deployment, wallet);
  const pairInfo = await getPairInfo(deployment, wallet);
  if (!pairInfo.pair) {
    throw new Error("Pair uREKT/WETH introuvable.");
  }

  const percent = Number(body.percent || 25);
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
    throw new Error("Percent must be in (0, 100].");
  }

  const lpBalance = await pairInfo.pair.balanceOf(wallet.address);
  if (lpBalance.isZero()) {
    throw new Error("No LP balance to remove.");
  }

  const liquidity = lpBalance.mul(Math.floor(percent * 100)).div(10000);
  if (liquidity.lte(0)) {
    throw new Error("LP amount too small.");
  }

  const allowance = await pairInfo.pair.allowance(wallet.address, deployment.router);
  if (allowance.lt(liquidity)) {
    const approveTx = await pairInfo.pair.approve(deployment.router, ethers.constants.MaxUint256);
    await approveTx.wait();
  }

  const deadline = Math.floor(Date.now() / 1000) + 20 * 60;
  const tx = await router.removeLiquidityETH(
    deployment.tokenA,
    liquidity,
    0,
    0,
    wallet.address,
    deadline
  );
  await tx.wait();

  const result = {
    txHash: tx.hash,
    percent,
    lpBurned: ethers.utils.formatEther(liquidity)
  };
  addActivity("remove_liquidity", result);
  return result;
}

async function runSwap(body) {
  const deployment = loadDeployment();
  await ensureLocalContracts(deployment);

  const { router, tokenA } = await getContracts(deployment, wallet);
  const amountIn = parseAmount(body.amountIn, "1000");
  const path = [deployment.tokenA, deployment.weth];

  const allowance = await tokenA.allowance(wallet.address, deployment.router);
  if (allowance.lt(amountIn)) {
    const approveTx = await tokenA.approve(deployment.router, ethers.constants.MaxUint256);
    await approveTx.wait();
  }

  const quote = await router.getAmountsOut(amountIn, path);
  const slippageBps = Number(body.slippageBps || 100);
  const amountOutMin = quote[1].mul(10000 - slippageBps).div(10000);
  const deadline = Math.floor(Date.now() / 1000) + 20 * 60;
  const tx = await router.swapExactTokensForETH(
    amountIn,
    amountOutMin,
    path,
    wallet.address,
    deadline
  );
  await tx.wait();

  const result = {
    txHash: tx.hash,
    amountIn: ethers.utils.formatEther(amountIn),
    quotedOut: ethers.utils.formatEther(quote[1]),
    minOut: ethers.utils.formatEther(amountOutMin),
    slippageBps
  };
  addActivity("swap", result);
  return result;
}

function resolveStaticPath(urlPath) {
  const cleanPath = (urlPath || "/").split("?")[0];
  if (cleanPath === "/" || cleanPath === "") {
    return path.join(ROOT, "ui", "index.html");
  }
  const normalized = path.normalize(cleanPath).replace(/^(\.\.[/\\])+/, "");
  return path.join(ROOT, normalized);
}

function handleError(res, error) {
  sendJson(res, 500, { error: error.message || String(error) });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");

    if (url.pathname === "/api/state" && req.method === "GET") {
      sendJson(res, 200, await getState());
      return;
    }
    if (url.pathname === "/api/activity" && req.method === "GET") {
      sendJson(res, 200, { items: activity });
      return;
    }
    if (url.pathname === "/api/quote" && req.method === "GET") {
      const deployment = loadDeployment();
      await ensureLocalContracts(deployment);
      sendJson(res, 200, await quoteSwap(deployment, url.searchParams.get("amountIn") || "1000"));
      return;
    }
    if (url.pathname === "/api/faucet" && req.method === "POST") {
      sendJson(res, 200, await faucetToken(await readBody(req)));
      return;
    }
    if ((url.pathname === "/api/seed" || url.pathname === "/api/liquidity/add") && req.method === "POST") {
      sendJson(res, 200, await addLiquidity(await readBody(req)));
      return;
    }
    if (url.pathname === "/api/liquidity/remove" && req.method === "POST") {
      sendJson(res, 200, await removeLiquidity(await readBody(req)));
      return;
    }
    if (url.pathname === "/api/swap" && req.method === "POST") {
      sendJson(res, 200, await runSwap(await readBody(req)));
      return;
    }

    const filePath = resolveStaticPath(req.url);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`Not found: ${filePath}`);
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(data);
    });
  } catch (error) {
    handleError(res, error);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Wojak UI on http://127.0.0.1:${PORT}`);
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Signer: ${wallet.address}`);
});
