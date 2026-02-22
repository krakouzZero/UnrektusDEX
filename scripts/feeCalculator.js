require("dotenv").config();

function toNumber(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function money(n) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function main() {
  const cliNumberArg = process.argv
    .slice(2)
    .map((v) => Number(v))
    .find((v) => Number.isFinite(v));
  const dailyVolume = toNumber(cliNumberArg ?? process.env.DEX_DAILY_VOLUME, 100000);
  const currency = process.env.DEX_FEE_CURRENCY || "USD";
  const protocolFeeOn = String(process.env.PROTOCOL_FEE_ON || "true").toLowerCase() !== "false";

  const swapFeeRate = 0.003; // 0.30%
  const totalFeesDaily = dailyVolume * swapFeeRate;
  const protocolDaily = protocolFeeOn ? totalFeesDaily / 6 : 0; // V2 feeTo share
  const lpDaily = totalFeesDaily - protocolDaily;

  const protocolMonthly = protocolDaily * 30;
  const protocolYearly = protocolDaily * 365;
  const lpMonthly = lpDaily * 30;
  const lpYearly = lpDaily * 365;

  console.log(`Assumptions`);
  console.log(`- Daily volume: ${money(dailyVolume)} ${currency}`);
  console.log(`- Swap fee: 0.30%`);
  console.log(`- Protocol fee switch (feeTo): ${protocolFeeOn ? "ON" : "OFF"}`);
  console.log("");
  console.log(`Fees/day`);
  console.log(`- Total paid by traders: ${money(totalFeesDaily)} ${currency}`);
  console.log(`- To LPs: ${money(lpDaily)} ${currency}`);
  console.log(`- To protocol: ${money(protocolDaily)} ${currency}`);
  console.log("");
  console.log(`Projection`);
  console.log(`- LP monthly: ${money(lpMonthly)} ${currency}`);
  console.log(`- Protocol monthly: ${money(protocolMonthly)} ${currency}`);
  console.log(`- LP yearly: ${money(lpYearly)} ${currency}`);
  console.log(`- Protocol yearly: ${money(protocolYearly)} ${currency}`);
}

main();
