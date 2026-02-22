const toastRoot = document.getElementById("toastRoot");
const connectBtn = document.getElementById("connectBtn");
const chainSelect = document.getElementById("chainSelect");
const walletBadge = document.getElementById("walletBadge");
const chainBadge = document.getElementById("chainBadge");

const tabs = [...document.querySelectorAll(".tab")];
const panels = [...document.querySelectorAll(".panel")];
const mobileNavToggle = document.getElementById("mobileNavToggle");
const mobileNavMenu = document.getElementById("mobileNavMenu");

const walletEth = document.getElementById("walletEth");
const walletToken = document.getElementById("walletToken");

const claimAmount = document.getElementById("claimAmount");
const claimProof = document.getElementById("claimProof");
const claimBtn = document.getElementById("claimBtn");
const claimStatus = document.getElementById("claimStatus");

const swapAmount = document.getElementById("swapAmount");
const swapFromToken = document.getElementById("swapFromToken");
const swapToToken = document.getElementById("swapToToken");
const slippagePreset = document.getElementById("slippagePreset");
const slippagePct = document.getElementById("slippagePct");
const quoteAmountOut = document.getElementById("quoteAmountOut");
const quoteResult = document.getElementById("quoteResult");
const swapBtn = document.getElementById("swapBtn");
const swapSwitchBtn = document.getElementById("swapSwitchBtn");
const swapMaxBtn = document.getElementById("swapMaxBtn");
const swapFromBalance = document.getElementById("swapFromBalance");
const swapToBalance = document.getElementById("swapToBalance");
const swapFromTokenLabel = document.getElementById("swapFromTokenLabel");
const swapToTokenLabel = document.getElementById("swapToTokenLabel");
const receiveAmount = document.getElementById("receiveAmount");
const receiveSymbol = document.getElementById("receiveSymbol");
const receiveNote = document.getElementById("receiveNote");

const liqTokenA = document.getElementById("liqTokenA");
const liqTokenB = document.getElementById("liqTokenB");
const liqAmountA = document.getElementById("liqAmountA");
const liqAmountB = document.getElementById("liqAmountB");
const seedBtn = document.getElementById("seedBtn");

const removePercent = document.getElementById("removePercent");
const removeBtn = document.getElementById("removeBtn");
const liqPairLabel = document.getElementById("liqPairLabel");
const liqPairAddress = document.getElementById("liqPairAddress");
const liqReserves = document.getElementById("liqReserves");
const liqMyLp = document.getElementById("liqMyLp");

const poolsBody = document.getElementById("poolsBody");

const NATIVE_ID = "native";
const FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
  "function allPairsLength() external view returns (uint256)",
  "function allPairs(uint256) external view returns (address)"
];
const ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function addLiquidityETH(address token,uint amountTokenDesired,uint amountTokenMin,uint amountETHMin,address to,uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)",
  "function addLiquidity(address tokenA,address tokenB,uint amountADesired,uint amountBDesired,uint amountAMin,uint amountBMin,address to,uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function removeLiquidityETH(address token,uint liquidity,uint amountTokenMin,uint amountETHMin,address to,uint deadline) external returns (uint amountToken, uint amountETH)",
  "function removeLiquidityETHSupportingFeeOnTransferTokens(address token,uint liquidity,uint amountTokenMin,uint amountETHMin,address to,uint deadline) external returns (uint amountETH)",
  "function removeLiquidity(address tokenA,address tokenB,uint liquidity,uint amountAMin,uint amountBMin,address to,uint deadline) external returns (uint amountA, uint amountB)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external returns (uint[] memory amounts)"
];
const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];
const PAIR_ABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function balanceOf(address owner) external view returns (uint)",
  "function allowance(address owner, address spender) external view returns (uint)",
  "function approve(address spender, uint value) external returns (bool)",
  "function totalSupply() external view returns (uint256)"
];
const CLAIM_ABI = ["function claim(uint256 amount, bytes32[] calldata merkleProof) external"];
const CLAIM_STATUS_ABI = [
  "function token() view returns (address)",
  "function totalClaimable() view returns (uint256)",
  "function claimedTotal() view returns (uint256)"
];

let config = null;
let selectedChain = null;
let deployment = null;
let provider = null;
let signer = null;
let account = null;
let tokenOptions = [];
let loadedProofsPath = "";
let loadedProofsMap = null;
const tokenMetaCache = new Map();
const balanceCache = new Map();

function notify(type, message, timeoutMs = 3200) {
  if (!toastRoot) return;
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.textContent = message;
  toastRoot.appendChild(item);
  window.setTimeout(() => {
    item.classList.add("hide");
    window.setTimeout(() => item.remove(), 240);
  }, timeoutMs);
}

function shortAddress(value) {
  if (!value) return "-";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function setWalletBadgeState(addr) {
  if (!walletBadge) return;
  const connected = Boolean(addr);
  walletBadge.textContent = connected ? shortAddress(addr) : "not connected";
  walletBadge.classList.toggle("status-connected", connected);
  walletBadge.classList.toggle("status-disconnected", !connected);
}

function formatNumber(value, digits = 6) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setTab(tabName) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tabName));
}

function tokenLogoUrl(token) {
  if (!token) return "";
  if (token.logoURI) return token.logoURI;
  const logos = selectedChain?.tokenLogos || {};
  if (token.isNative) return logos.native || "";
  const byAddress = token.address ? logos[token.address.toLowerCase()] : "";
  return byAddress || logos[token.symbol] || "";
}

function tokenLabelHtml(token) {
  const sym = escapeHtml(token?.symbol || "TOKEN");
  const logo = tokenLogoUrl(token);
  if (!logo) return sym;
  return `<span class="token-with-logo"><img class="token-dot" src="${escapeHtml(logo)}" alt="${sym}" />${sym}</span>`;
}

function pairPillHtml(tokenA, tokenB) {
  const logoA = tokenLogoUrl(tokenA);
  const logoB = tokenLogoUrl(tokenB);
  const symA = escapeHtml(tokenA?.symbol || "T0");
  const symB = escapeHtml(tokenB?.symbol || "T1");
  const iconA = logoA ? `<img class="token-dot" src="${escapeHtml(logoA)}" alt="${symA}" />` : "";
  const iconB = logoB ? `<img class="token-dot" src="${escapeHtml(logoB)}" alt="${symB}" />` : "";
  return `<span class="pair-pill">${iconA}${iconB}<span>${symA}/${symB}</span></span>`;
}

function friendlyRpcError(error) {
  const raw = String(error?.message || error || "");
  if (raw.includes("TransferHelper::transferFrom: transferFrom failed")) {
    return "Insufficient token amount in wallet, or allowance missing.";
  }
  if (raw.includes("LP amount too small")) return "LP amount too small.";
  if (raw.includes("Pair not found")) return "Pair not found for selected tokens.";
  if (raw.includes("cannot estimate gas") || raw.includes("UNPREDICTABLE_GAS_LIMIT")) {
    return "Remove liquidity failed at gas estimation. Check LP balance, selected pair, and token limits/taxes.";
  }
  if (raw.includes("execution reverted")) {
    return "Transaction reverted on-chain (pair/tokens/limits).";
  }
  if (
    raw.includes("RPC endpoint returned too many errors") ||
    raw.includes("Internal JSON-RPC error")
  ) {
    return "RPC surcharge. Essaie un endpoint RPC Dogechain plus stable.";
  }
  return raw;
}

function getWrappedNativeSymbol() {
  if (selectedChain?.wrappedNativeSymbol) return selectedChain.wrappedNativeSymbol;
  const native = selectedChain?.nativeCurrency?.symbol || "NATIVE";
  return /^w/i.test(native) ? native : `w${native}`;
}

async function loadConfig() {
  const res = await fetch("./chains.json");
  config = await res.json();
  const keys = Object.keys(config.chains);
  keys.forEach((key) => {
    const chain = config.chains[key];
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = chain.name;
    chainSelect.appendChild(opt);
  });
  chainSelect.value = config.defaultChainKey || keys[0];
  selectedChain = config.chains[chainSelect.value];
}

async function loadDeploymentForChain(chain) {
  if (chain.contractsFromDeploymentFile) {
    const res = await fetch(chain.deploymentFile);
    if (!res.ok) throw new Error(`Missing deployment file: ${chain.deploymentFile}`);
    return res.json();
  }
  return chain.contracts || {};
}

function ensureContractsReady(d) {
  if (!d.router || !d.factory || !d.weth || !d.tokenA) {
    throw new Error("Contracts not configured for this chain. Fill ui/chains.json.");
  }
}

function getReadProvider() {
  if (provider) return provider;
  return new ethers.providers.JsonRpcProvider(selectedChain.rpcUrls[0]);
}

async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask not detected");
  provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  account = await signer.getAddress();
  setWalletBadgeState(account);
  notify("success", `Wallet connected: ${shortAddress(account)}`, 2200);
}

async function switchChainIfNeeded() {
  if (!provider || !selectedChain) return;
  const current = await provider.getNetwork();
  if (current.chainId === selectedChain.chainId) return;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: selectedChain.chainIdHex }]
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: selectedChain.chainIdHex,
            chainName: selectedChain.name,
            nativeCurrency: selectedChain.nativeCurrency,
            rpcUrls: selectedChain.rpcUrls,
            blockExplorerUrls: selectedChain.blockExplorerUrls || []
          }
        ]
      });
    } else {
      throw error;
    }
  }
}

function resolveProofsFilePath() {
  const fromDeployment = deployment?.claimProofsFile || deployment?.claimMerkleFile;
  const fromChain = selectedChain?.claimProofsFile || selectedChain?.claimMerkleFile;
  const candidate = fromDeployment || fromChain || "";
  if (!candidate) return "";
  if (candidate.endsWith("-merkle.json")) return candidate.replace(/-merkle\.json$/i, "-proofs.json");
  return candidate;
}

async function loadProofsMapIfNeeded() {
  const filePath = resolveProofsFilePath();
  if (!filePath) return null;
  if (loadedProofsPath === filePath && loadedProofsMap) return loadedProofsMap;

  const url = filePath.startsWith("/") ? filePath : `/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Proofs file not found: ${filePath}`);
  const data = await res.json();
  loadedProofsPath = filePath;
  loadedProofsMap = data.proofsByAddress || null;
  return loadedProofsMap;
}

async function getTokenMeta(address, io) {
  if (!address) return null;
  const key = address.toLowerCase();
  if (tokenMetaCache.has(key)) return tokenMetaCache.get(key);
  const read = io || getReadProvider();
  const token = new ethers.Contract(address, ERC20_ABI, read);
  let symbol = "TOKEN";
  let decimals = 18;
  try {
    symbol = await token.symbol();
  } catch (_) {}
  try {
    decimals = Number(await token.decimals());
  } catch (_) {}
  if (deployment?.weth && key === deployment.weth.toLowerCase()) {
    symbol = getWrappedNativeSymbol();
  }
  const meta = { id: key, address: ethers.utils.getAddress(address), symbol, decimals, isNative: false };
  tokenMetaCache.set(key, meta);
  return meta;
}

async function buildTokenOptions() {
  const list = [];
  const nativeSymbol = selectedChain?.nativeCurrency?.symbol || "NATIVE";
  list.push({
    id: NATIVE_ID,
    address: null,
    symbol: nativeSymbol,
    decimals: 18,
    isNative: true,
    logoURI: selectedChain?.tokenLogos?.native || ""
  });

  const tokenA = await getTokenMeta(deployment.tokenA);
  list.push(tokenA);

  const extra = Array.isArray(selectedChain.tokens) ? selectedChain.tokens : [];
  for (const t of extra) {
    if (!t?.address) continue;
    const meta = await getTokenMeta(t.address);
    list.push({
      ...meta,
      logoURI: t.logoURI || t.logo || meta.logoURI || ""
    });
  }

  const dedup = new Map();
  for (const t of list) dedup.set(t.id, t);
  tokenOptions = [...dedup.values()];
}

function renderTokenSelect(selectEl, preferredId) {
  const current = preferredId || selectEl.value;
  selectEl.innerHTML = "";
  for (const t of tokenOptions) {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.symbol;
    selectEl.appendChild(opt);
  }
  if ([...tokenOptions].find((t) => t.id === current)) {
    selectEl.value = current;
  }
}

function getTokenById(id) {
  return tokenOptions.find((t) => t.id === id) || null;
}

function toRouterAddress(token) {
  return token.isNative ? deployment.weth : token.address;
}

function buildPath(fromToken, toToken) {
  if (fromToken.isNative && toToken.isNative) throw new Error("Native/native not supported");
  if (fromToken.isNative) return [deployment.weth, toToken.address];
  if (toToken.isNative) return [fromToken.address, deployment.weth];
  return [fromToken.address, toToken.address];
}

function parseAmountForToken(token, value, fallback = "0") {
  return ethers.utils.parseUnits(String(value || fallback), token.decimals);
}

function formatAmountForToken(token, raw, precision = 6) {
  const v = ethers.utils.formatUnits(raw, token.decimals);
  return formatNumber(v, precision);
}

function resetSwapDetails() {
  receiveAmount.textContent = "-";
  receiveSymbol.textContent = "-";
  receiveNote.textContent = "Enter an amount";
}

function getSlippageBps() {
  const pct = Number(slippagePct.value || 0.5);
  if (!Number.isFinite(pct) || pct <= 0) return 50;
  return Math.floor(pct * 100);
}

function syncSlippagePresetFromInput() {
  const pct = Number(slippagePct.value || 0);
  const presets = ["0.1", "0.5", "1", "3"];
  const asString = String(pct);
  if (presets.includes(asString)) {
    slippagePreset.value = asString;
  } else {
    slippagePreset.value = "custom";
  }
}

async function readUserBalance(token) {
  if (!token) return ethers.constants.Zero;
  const read = getReadProvider();
  const user = account || deployment?.deployer || null;
  if (!user) return ethers.constants.Zero;
  const key = `${selectedChain?.chainId}:${user.toLowerCase()}:${token.id}`;
  if (balanceCache.has(key)) return balanceCache.get(key);

  let bal = ethers.constants.Zero;
  if (token.isNative) {
    bal = await read.getBalance(user);
  } else {
    const erc20 = new ethers.Contract(token.address, ERC20_ABI, read);
    bal = await erc20.balanceOf(user);
  }
  balanceCache.set(key, bal);
  return bal;
}

async function refreshSwapBalances() {
  const fromToken = getTokenById(swapFromToken.value);
  const toToken = getTokenById(swapToToken.value);
  if (!fromToken || !toToken) return;

  swapFromTokenLabel.innerHTML = tokenLabelHtml(fromToken);
  swapToTokenLabel.innerHTML = tokenLabelHtml(toToken);

  const [fromBal, toBal] = await Promise.all([readUserBalance(fromToken), readUserBalance(toToken)]);
  swapFromBalance.textContent = `Balance: ${formatAmountForToken(fromToken, fromBal, 3)}`;
  swapToBalance.textContent = `Balance: ${formatAmountForToken(toToken, toBal, 3)}`;
}

async function getContracts(useSigner = false) {
  const io = useSigner ? signer : getReadProvider();
  return {
    factory: new ethers.Contract(deployment.factory, FACTORY_ABI, io),
    router: new ethers.Contract(deployment.router, ROUTER_ABI, io)
  };
}

async function getPairAddress(tokenA, tokenB) {
  const { factory } = await getContracts(false);
  return factory.getPair(toRouterAddress(tokenA), toRouterAddress(tokenB));
}

async function ensureApproval(token, owner, spender, amount) {
  if (token.isNative) return;
  const erc20 = new ethers.Contract(token.address, ERC20_ABI, signer);
  const allowance = await erc20.allowance(owner, spender);
  if (allowance.lt(amount)) {
    await (await erc20.approve(spender, ethers.constants.MaxUint256)).wait();
  }
}

async function refreshQuote() {
  if (!deployment) return;
  try {
    const fromToken = getTokenById(swapFromToken.value);
    const toToken = getTokenById(swapToToken.value);
    if (!fromToken || !toToken) return;
    if (fromToken.id === toToken.id) {
      quoteResult.textContent = "Choose two different tokens.";
      quoteAmountOut.value = "-";
      resetSwapDetails();
      return;
    }

    const amountIn = parseAmountForToken(fromToken, swapAmount.value || "0");
    if (amountIn.lte(0)) {
      quoteResult.textContent = "Enter an amount";
      quoteAmountOut.value = "-";
      resetSwapDetails();
      return;
    }

    const { router } = await getContracts(false);
    const path = buildPath(fromToken, toToken);
    const amounts = await router.getAmountsOut(amountIn, path);
    const outQuoted = amounts[amounts.length - 1];
    const outQuotedText = ethers.utils.formatUnits(outQuoted, toToken.decimals);
    const slip = getSlippageBps();
    const minOut = outQuoted.mul(10000 - slip).div(10000);
    const minOutText = ethers.utils.formatUnits(minOut, toToken.decimals);

    quoteAmountOut.value = outQuotedText;
    quoteResult.textContent = `${swapAmount.value} ${fromToken.symbol} -> ${outQuotedText} ${toToken.symbol}`;
    receiveAmount.textContent = formatNumber(outQuotedText, 6);
    receiveSymbol.textContent = toToken.symbol;
    receiveNote.textContent = `Minimum after slippage: ${formatNumber(minOutText, 6)} ${toToken.symbol}`;
  } catch (error) {
    quoteAmountOut.value = "-";
    quoteResult.textContent = "Quote unavailable for this pair.";
    resetSwapDetails();
    receiveNote.textContent = "Pair or liquidity unavailable.";
  }
}

async function autoFillClaimForAccount() {
  if (!account) return;
  const claimContract = deployment?.claim || selectedChain?.contracts?.claim;
  if (!claimContract) {
    claimStatus.textContent = "Claim contract non configure pour cette chain.";
    return;
  }
  try {
    const tokenA = tokenOptions.find((t) => !t.isNative && t.address.toLowerCase() === deployment.tokenA.toLowerCase());
    const proofsMap = await loadProofsMapIfNeeded();
    if (!proofsMap) {
      claimStatus.textContent = `Claim contract: ${shortAddress(claimContract)} (proofs absents)`;
      return;
    }
    const row = proofsMap[account.toLowerCase()];
    if (!row) {
      claimStatus.textContent = "Adresse non eligible dans ce snapshot.";
      return;
    }
    const decimals = tokenA?.decimals || 18;
    claimAmount.value = ethers.utils.formatUnits(row.amount, decimals);
    claimProof.value = JSON.stringify(row.proof || []);
    claimStatus.textContent = `Eligible: ${claimAmount.value} ${tokenA?.symbol || "TOKEN"}`;
  } catch (error) {
    claimStatus.textContent = "Proofs indisponibles pour le moment.";
  }
}

async function refreshPools() {
  poolsBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  try {
    const { factory } = await getContracts(false);
    const rows = [];

    try {
      const len = Number(await factory.allPairsLength());
      const start = Math.max(0, len - 12);
      for (let i = len - 1; i >= start; i--) {
        const pairAddr = await factory.allPairs(i);
        const pair = new ethers.Contract(pairAddr, PAIR_ABI, getReadProvider());
        const [r, t0, t1, supply] = await Promise.all([
          pair.getReserves(),
          pair.token0(),
          pair.token1(),
          pair.totalSupply()
        ]);
        const m0 = await getTokenMeta(t0);
        const m1 = await getTokenMeta(t1);
        rows.push({
          pair: `${m0.symbol}/${m1.symbol}`,
          m0,
          m1,
          reserve0: formatAmountForToken(m0, r.reserve0, 4),
          reserve1: formatAmountForToken(m1, r.reserve1, 4),
          lp: ethers.utils.formatEther(supply),
          address: pairAddr
        });
      }
    } catch (_) {
      const a = getTokenById(liqTokenA.value);
      const b = getTokenById(liqTokenB.value);
      if (a && b && a.id !== b.id) {
        const addr = await getPairAddress(a, b);
        if (addr && addr !== ethers.constants.AddressZero) {
          const pair = new ethers.Contract(addr, PAIR_ABI, getReadProvider());
          const [r, t0, t1, supply] = await Promise.all([
            pair.getReserves(),
            pair.token0(),
            pair.token1(),
            pair.totalSupply()
          ]);
          const m0 = await getTokenMeta(t0);
          const m1 = await getTokenMeta(t1);
          rows.push({
            pair: `${m0.symbol}/${m1.symbol}`,
            m0,
            m1,
            reserve0: formatAmountForToken(m0, r.reserve0, 4),
            reserve1: formatAmountForToken(m1, r.reserve1, 4),
            lp: ethers.utils.formatEther(supply),
            address: addr
          });
        }
      }
    }

    if (!rows.length) {
      poolsBody.innerHTML = '<tr><td colspan="5">No pools found.</td></tr>';
      return;
    }

    poolsBody.innerHTML = rows
      .map(
        (row) =>
          `<tr>
            <td>${pairPillHtml(row.m0, row.m1)}</td>
            <td><div class="reserve-stack"><span class="reserve-chip">${row.reserve0}</span></div></td>
            <td><div class="reserve-stack"><span class="reserve-chip">${row.reserve1}</span></div></td>
            <td><span class="lp-badge">${formatNumber(row.lp, 4)}</span></td>
            <td class="addr">${shortAddress(row.address)}</td>
          </tr>`
      )
      .join("");
  } catch (error) {
    poolsBody.innerHTML = '<tr><td colspan="5">Pool list unavailable.</td></tr>';
  }
}

async function refreshSelectedPairInfo() {
  const a = getTokenById(liqTokenA.value);
  const b = getTokenById(liqTokenB.value);
  if (!a || !b || a.id === b.id) {
    liqPairLabel.textContent = "-";
    liqPairAddress.textContent = "-";
    liqReserves.textContent = "-";
    liqMyLp.textContent = "-";
    return;
  }
  liqPairLabel.textContent = `${a.symbol}/${b.symbol}`;

  try {
    const pairAddress = await getPairAddress(a, b);
    if (!pairAddress || pairAddress === ethers.constants.AddressZero) {
      liqPairAddress.textContent = "No pool";
      liqReserves.textContent = "-";
      liqMyLp.textContent = "0";
      return;
    }
    liqPairAddress.textContent = shortAddress(pairAddress);

    const pairRead = new ethers.Contract(pairAddress, PAIR_ABI, getReadProvider());
    const [r, t0, t1] = await Promise.all([pairRead.getReserves(), pairRead.token0(), pairRead.token1()]);
    const m0 = await getTokenMeta(t0);
    const m1 = await getTokenMeta(t1);
    liqReserves.textContent = `${formatAmountForToken(m0, r.reserve0, 3)} ${m0.symbol} / ${formatAmountForToken(m1, r.reserve1, 3)} ${m1.symbol}`;

    if (!account) {
      liqMyLp.textContent = "-";
      return;
    }
    const lp = await pairRead.balanceOf(account);
    liqMyLp.textContent = formatNumber(ethers.utils.formatEther(lp), 6);
  } catch (_) {
    liqPairAddress.textContent = "-";
    liqReserves.textContent = "-";
    liqMyLp.textContent = "-";
  }
}

async function refreshState() {
  try {
    deployment = await loadDeploymentForChain(selectedChain);
    ensureContractsReady(deployment);

    const nativeSymbol = selectedChain?.nativeCurrency?.symbol || "NATIVE";
    chainBadge.textContent = `${selectedChain.name} (${selectedChain.chainId})`;
    setWalletBadgeState(account);

    await buildTokenOptions();
    renderTokenSelect(swapFromToken, swapFromToken.value || NATIVE_ID);
    renderTokenSelect(swapToToken, swapToToken.value || deployment.tokenA.toLowerCase());
    renderTokenSelect(liqTokenA, liqTokenA.value || NATIVE_ID);
    renderTokenSelect(liqTokenB, liqTokenB.value || deployment.tokenA.toLowerCase());

    if (swapFromToken.value === swapToToken.value) {
      swapToToken.value = swapFromToken.value === NATIVE_ID ? deployment.tokenA.toLowerCase() : NATIVE_ID;
    }
    if (liqTokenA.value === liqTokenB.value) {
      liqTokenB.value = liqTokenA.value === NATIVE_ID ? deployment.tokenA.toLowerCase() : NATIVE_ID;
    }

    const read = getReadProvider();
    const current = account || deployment.deployer || null;

    const nativeBal = current ? await read.getBalance(current) : ethers.constants.Zero;
    walletEth.textContent = `${nativeSymbol}: ${formatNumber(ethers.utils.formatEther(nativeBal), 4)}`;

    const urekt = tokenOptions.find((t) => !t.isNative && t.address.toLowerCase() === deployment.tokenA.toLowerCase());
    if (current && urekt) {
      const token = new ethers.Contract(urekt.address, ERC20_ABI, read);
      const bal = await token.balanceOf(current);
      walletToken.textContent = `uREKT: ${formatAmountForToken(urekt, bal, 4)}`;
    } else {
      walletToken.textContent = "uREKT: -";
    }
    await refreshQuote();
    await refreshSwapBalances();
    await refreshSelectedPairInfo();
    await refreshPools();

    const claimContract = deployment?.claim || selectedChain?.contracts?.claim;
    claimBtn.disabled = false;
    claimStatus.textContent = claimContract
      ? `Claim contract: ${shortAddress(claimContract)}`
      : "Claim contract non configure pour cette chain.";
    if (claimContract) {
      try {
        const claimRead = new ethers.Contract(claimContract, CLAIM_STATUS_ABI, read);
        const [claimTokenAddr, totalClaimable, claimedTotal] = await Promise.all([
          claimRead.token(),
          claimRead.totalClaimable(),
          claimRead.claimedTotal()
        ]);
        const claimToken = new ethers.Contract(claimTokenAddr, ERC20_ABI, read);
        const claimBalance = await claimToken.balanceOf(claimContract);
        const requiredReserve = totalClaimable.sub(claimedTotal);
        if (claimBalance.lt(requiredReserve)) {
          claimBtn.disabled = true;
          claimStatus.textContent = "Claim maintenance: funding in progress.";
        }
      } catch (_) {}
    }
    await autoFillClaimForAccount();
  } catch (error) {
    notify("error", friendlyRpcError(error));
  }
}

async function requireSigner() {
  if (!provider || !signer || !account) await connectWallet();
  await switchChainIfNeeded();
}

async function withTx(label, run) {
  try {
    await requireSigner();
    const tx = await run();
    await tx.wait();
    notify("success", `${label.replaceAll("_", " ")} success`);
    await refreshState();
  } catch (error) {
    notify("error", friendlyRpcError(error));
  }
}

tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    setTab(tab.dataset.tab);
    if (mobileNavMenu) mobileNavMenu.classList.remove("open");
  })
);

if (mobileNavToggle && mobileNavMenu) {
  mobileNavToggle.addEventListener("click", () => {
    mobileNavMenu.classList.toggle("open");
  });
}

chainSelect.addEventListener("change", async () => {
  selectedChain = config.chains[chainSelect.value];
  loadedProofsPath = "";
  loadedProofsMap = null;
  tokenMetaCache.clear();
  balanceCache.clear();
  notify("success", `Chain: ${selectedChain.name}`, 1800);
  await refreshState();
});

connectBtn.addEventListener("click", async () => {
  try {
    await connectWallet();
    await switchChainIfNeeded();
    await refreshState();
  } catch (error) {
    notify("error", friendlyRpcError(error));
  }
});

[swapAmount].forEach((el) => el.addEventListener("input", refreshQuote));
[swapFromToken, swapToToken].forEach((el) => {
  el.addEventListener("input", refreshQuote);
  el.addEventListener("change", async () => {
    await refreshQuote();
    await refreshSwapBalances();
  });
});
slippagePct.addEventListener("input", refreshQuote);
slippagePct.addEventListener("input", syncSlippagePresetFromInput);
slippagePreset.addEventListener("change", async () => {
  if (slippagePreset.value !== "custom") {
    slippagePct.value = slippagePreset.value;
  }
  await refreshQuote();
});
swapSwitchBtn.addEventListener("click", async () => {
  const prevAmountIn = swapAmount.value;
  const prevAmountOut = quoteAmountOut.value;
  const prevFrom = swapFromToken.value;
  swapFromToken.value = swapToToken.value;
  swapToToken.value = prevFrom;
  if (swapFromToken.value === swapToToken.value) {
    swapToToken.value = swapFromToken.value === NATIVE_ID ? deployment.tokenA.toLowerCase() : NATIVE_ID;
  }
  if (prevAmountOut && prevAmountOut !== "-") {
    swapAmount.value = String(prevAmountOut).replaceAll(",", ".");
    quoteAmountOut.value = prevAmountIn || "-";
  }
  await refreshQuote();
  await refreshSwapBalances();
});
swapMaxBtn.addEventListener("click", async () => {
  const fromToken = getTokenById(swapFromToken.value);
  if (!fromToken) return;
  const bal = await readUserBalance(fromToken);
  swapAmount.value = ethers.utils.formatUnits(bal, fromToken.decimals);
  await refreshQuote();
});

swapFromBalance.addEventListener("click", async () => {
  const fromToken = getTokenById(swapFromToken.value);
  if (!fromToken) return;
  const bal = await readUserBalance(fromToken);
  swapAmount.value = ethers.utils.formatUnits(bal, fromToken.decimals);
  await refreshQuote();
});

swapToBalance.addEventListener("click", async () => {
  const toToken = getTokenById(swapToToken.value);
  if (!toToken) return;
  const bal = await readUserBalance(toToken);
  const text = formatAmountForToken(toToken, bal, 6);
  quoteAmountOut.value = text;
  receiveAmount.textContent = text;
  receiveSymbol.textContent = toToken.symbol;
  receiveNote.textContent = "Filled from wallet balance";
});

[liqTokenA, liqTokenB].forEach((el) =>
  el.addEventListener("change", async () => {
    await refreshSelectedPairInfo();
    await refreshPools();
  })
);

swapBtn.addEventListener("click", () =>
  withTx("swap", async () => {
    const fromToken = getTokenById(swapFromToken.value);
    const toToken = getTokenById(swapToToken.value);
    if (!fromToken || !toToken || fromToken.id === toToken.id) {
      throw new Error("Select two different tokens.");
    }

    const amountIn = parseAmountForToken(fromToken, swapAmount.value || "0");
    if (amountIn.lte(0)) throw new Error("Amount must be > 0");

    const { router } = await getContracts(true);
    const path = buildPath(fromToken, toToken);
    const quote = await router.getAmountsOut(amountIn, path);
    const slip = getSlippageBps();
    const outQuoted = quote[quote.length - 1];
    const minOut = outQuoted.mul(10000 - slip).div(10000);
    const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

    if (!fromToken.isNative) {
      await ensureApproval(fromToken, account, deployment.router, amountIn);
    }

    if (fromToken.isNative) {
      return router.swapExactETHForTokens(minOut, path, account, deadline, { value: amountIn });
    }
    if (toToken.isNative) {
      return router.swapExactTokensForETH(amountIn, minOut, path, account, deadline);
    }
    return router.swapExactTokensForTokens(amountIn, minOut, path, account, deadline);
  })
);

seedBtn.addEventListener("click", () =>
  withTx("add_liquidity", async () => {
    const a = getTokenById(liqTokenA.value);
    const b = getTokenById(liqTokenB.value);
    if (!a || !b || a.id === b.id) throw new Error("Select two different tokens.");

    const amountA = parseAmountForToken(a, liqAmountA.value || "0");
    const amountB = parseAmountForToken(b, liqAmountB.value || "0");
    if (amountA.lte(0) || amountB.lte(0)) throw new Error("Amounts must be > 0");

    const { router } = await getContracts(true);
    const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

    if (a.isNative && b.isNative) throw new Error("Native/native not supported.");

    if (a.isNative || b.isNative) {
      const token = a.isNative ? b : a;
      const tokenAmount = a.isNative ? amountB : amountA;
      const nativeAmount = a.isNative ? amountA : amountB;
      await ensureApproval(token, account, deployment.router, tokenAmount);
      return router.addLiquidityETH(token.address, tokenAmount, 0, 0, account, deadline, {
        value: nativeAmount
      });
    }

    await ensureApproval(a, account, deployment.router, amountA);
    await ensureApproval(b, account, deployment.router, amountB);
    return router.addLiquidity(a.address, b.address, amountA, amountB, 0, 0, account, deadline);
  })
);

removeBtn.addEventListener("click", () =>
  withTx("remove_liquidity", async () => {
    const a = getTokenById(liqTokenA.value);
    const b = getTokenById(liqTokenB.value);
    if (!a || !b || a.id === b.id) throw new Error("Select two different tokens.");

    const pairAddress = await getPairAddress(a, b);
    if (!pairAddress || pairAddress === ethers.constants.AddressZero) {
      throw new Error("Pair not found.");
    }

    const pair = new ethers.Contract(pairAddress, PAIR_ABI, signer);
    const lpBal = await pair.balanceOf(account);
    const pct = Number(removePercent.value || 25);
    const liq = lpBal.mul(Math.floor(pct * 100)).div(10000);
    if (liq.lte(0)) throw new Error("LP amount too small.");

    const allowance = await pair.allowance(account, deployment.router);
    if (allowance.lt(liq)) {
      await (await pair.approve(deployment.router, ethers.constants.MaxUint256)).wait();
    }

    const { router } = await getContracts(true);
    const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

    if (a.isNative || b.isNative) {
      const token = a.isNative ? b : a;
      return router.removeLiquidityETHSupportingFeeOnTransferTokens(token.address, liq, 0, 0, account, deadline);
    }

    return router.removeLiquidity(a.address, b.address, liq, 0, 0, account, deadline);
  })
);

claimBtn.addEventListener("click", () =>
  withTx("claim", async () => {
    const claimContract = deployment?.claim || selectedChain?.contracts?.claim;
    if (!claimContract) throw new Error("Claim contract not configured.");

    const tokenA = tokenOptions.find((t) => !t.isNative && t.address.toLowerCase() === deployment.tokenA.toLowerCase());
    const decimals = tokenA?.decimals || 18;
    const amount = ethers.utils.parseUnits(String(claimAmount.value || "0"), decimals);
    if (amount.lte(0)) throw new Error("Claim amount invalid.");

    let proof = [];
    try {
      proof = JSON.parse(claimProof.value || "[]");
      if (!Array.isArray(proof)) throw new Error("bad");
    } catch (_) {
      throw new Error("Proof must be a JSON array.");
    }

    const claim = new ethers.Contract(claimContract, CLAIM_ABI, signer);
    claimStatus.textContent = "Claim transaction pending...";
    return claim.claim(amount, proof);
  })
);

async function init() {
  if (!window.ethers) {
    notify("error", "ethers library not loaded.");
    return;
  }
  syncSlippagePresetFromInput();
  await loadConfig();
  await refreshState();
}

init();
