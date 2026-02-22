// src/index.ts
import JSBI8 from "jsbi";

// src/constants.ts
import JSBI2 from "jsbi";

// src/entities/token.ts
import invariant3 from "tiny-invariant";

// src/utils.ts
import invariant from "tiny-invariant";
import warning from "tiny-warning";
import JSBI from "jsbi";
import { getAddress } from "@ethersproject/address";
function validateSolidityTypeInstance(value, solidityType) {
  invariant(JSBI.greaterThanOrEqual(value, ZERO), `${value} is not a ${solidityType}.`);
  invariant(JSBI.lessThanOrEqual(value, SOLIDITY_TYPE_MAXIMA[solidityType]), `${value} is not a ${solidityType}.`);
}
function validateAndParseAddress(address) {
  try {
    const checksummedAddress = getAddress(address);
    warning(address === checksummedAddress, `${address} is not checksummed.`);
    return checksummedAddress;
  } catch (error) {
    invariant(false, `${address} is not a valid address.`);
  }
}
function sqrt(y) {
  validateSolidityTypeInstance(y, "uint256" /* uint256 */);
  let z = ZERO;
  let x;
  if (JSBI.greaterThan(y, THREE)) {
    z = y;
    x = JSBI.add(JSBI.divide(y, TWO), ONE);
    while (JSBI.lessThan(x, z)) {
      z = x;
      x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO);
    }
  } else if (JSBI.notEqual(y, ZERO)) {
    z = ONE;
  }
  return z;
}
function sortedInsert(items, add, maxSize, comparator) {
  invariant(maxSize > 0, "MAX_SIZE_ZERO");
  invariant(items.length <= maxSize, "ITEMS_SIZE");
  if (items.length === 0) {
    items.push(add);
    return null;
  } else {
    const isFull = items.length === maxSize;
    if (isFull && comparator(items[items.length - 1], add) <= 0) {
      return add;
    }
    let lo = 0, hi = items.length;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (comparator(items[mid], add) <= 0) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    items.splice(lo, 0, add);
    return isFull ? items.pop() : null;
  }
}
function computePriceImpact(midPrice, inputAmount, outputAmount) {
  const quotedOutputAmount = midPrice.quote(inputAmount);
  const priceImpact = quotedOutputAmount.subtract(outputAmount).divide(quotedOutputAmount);
  return new Percent(priceImpact.numerator, priceImpact.denominator);
}

// src/entities/baseCurrency.ts
import invariant2 from "tiny-invariant";
var BaseCurrency = class {
  constructor(chainId, decimals, symbol, name) {
    invariant2(Number.isSafeInteger(chainId), "CHAIN_ID");
    invariant2(decimals >= 0 && decimals < 255 && Number.isInteger(decimals), "DECIMALS");
    this.chainId = chainId;
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
  }
};

// src/entities/token.ts
var Token = class extends BaseCurrency {
  constructor(chainId, address, decimals, symbol, name, projectLink) {
    super(chainId, decimals, symbol, name);
    this.isNative = false;
    this.isToken = true;
    this.address = validateAndParseAddress(address);
    this.projectLink = projectLink;
  }
  equals(other) {
    return other.isToken && this.chainId === other.chainId && this.address === other.address;
  }
  sortsBefore(other) {
    invariant3(this.chainId === other.chainId, "CHAIN_IDS");
    invariant3(this.address !== other.address, "ADDRESSES");
    return this.address.toLowerCase() < other.address.toLowerCase();
  }
  get wrapped() {
    return this;
  }
  get serialize() {
    return {
      address: this.address,
      chainId: this.chainId,
      decimals: this.decimals,
      symbol: this.symbol,
      name: this.name,
      projectLink: this.projectLink
    };
  }
};

// src/constants.ts
var ChainId = /* @__PURE__ */ ((ChainId2) => {
  ChainId2[ChainId2["BSC"] = 56] = "BSC";
  ChainId2[ChainId2["BSC_TESTNET"] = 97] = "BSC_TESTNET";
  ChainId2[ChainId2["DOGECHAIN"] = 2e3] = "DOGECHAIN";
  return ChainId2;
})(ChainId || {});
var TradeType = /* @__PURE__ */ ((TradeType2) => {
  TradeType2[TradeType2["EXACT_INPUT"] = 0] = "EXACT_INPUT";
  TradeType2[TradeType2["EXACT_OUTPUT"] = 1] = "EXACT_OUTPUT";
  return TradeType2;
})(TradeType || {});
var Rounding = /* @__PURE__ */ ((Rounding2) => {
  Rounding2[Rounding2["ROUND_DOWN"] = 0] = "ROUND_DOWN";
  Rounding2[Rounding2["ROUND_HALF_UP"] = 1] = "ROUND_HALF_UP";
  Rounding2[Rounding2["ROUND_UP"] = 2] = "ROUND_UP";
  return Rounding2;
})(Rounding || {});
var FACTORY_ADDRESS_BSC = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
var FACTORY_ADDRESS_BSC_TESTNET = "0x6725f303b657a9451d8ba641348b6761a6cc7a17";
var FACTORY_ADDRESS_DC = "0xc7c86B4f940Ff1C13c736b697e3FbA5a6Bc979F9";
var FACTORY_ADDRESS_MAP = {
  [56 /* BSC */]: FACTORY_ADDRESS_BSC,
  [97 /* BSC_TESTNET */]: FACTORY_ADDRESS_BSC_TESTNET,
  [2e3 /* DOGECHAIN */]: FACTORY_ADDRESS_DC
};
var INIT_CODE_HASH_BSC = "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5";
var INIT_CODE_HASH_BSC_TESTNET = "0xd0d4c4cd0848c93cb4fd1f498d7013ee6bfb25783ea21593d5834f5d250ece66";
var INIT_CODE_HASH_DC = "0x7856aa433cee3d1a7f4b34cd0f0cf0967c2345e951944c19991f4a73d0f5eee6";
var INIT_CODE_HASH_MAP = {
  [56 /* BSC */]: INIT_CODE_HASH_BSC,
  [97 /* BSC_TESTNET */]: INIT_CODE_HASH_BSC_TESTNET,
  [2e3 /* DOGECHAIN */]: INIT_CODE_HASH_DC
};
var MINIMUM_LIQUIDITY = JSBI2.BigInt(1e3);
var ZERO = JSBI2.BigInt(0);
var ONE = JSBI2.BigInt(1);
var TWO = JSBI2.BigInt(2);
var THREE = JSBI2.BigInt(3);
var FIVE = JSBI2.BigInt(5);
var TEN = JSBI2.BigInt(10);
var _100 = JSBI2.BigInt(100);
var _9975 = JSBI2.BigInt(9975);
var _10000 = JSBI2.BigInt(1e4);
var MaxUint256 = JSBI2.BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
var SolidityType = /* @__PURE__ */ ((SolidityType2) => {
  SolidityType2["uint8"] = "uint8";
  SolidityType2["uint256"] = "uint256";
  return SolidityType2;
})(SolidityType || {});
var SOLIDITY_TYPE_MAXIMA = {
  ["uint8" /* uint8 */]: JSBI2.BigInt("0xff"),
  ["uint256" /* uint256 */]: JSBI2.BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
};
var WETH9 = {
  [2e3 /* DOGECHAIN */]: new Token(2e3 /* DOGECHAIN */, "0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101", 18, "DOGE", "Wrapped DOGE", "https://dogechain.dog/")
};
var WBNB = {
  [56 /* BSC */]: new Token(56 /* BSC */, "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", 18, "WBNB", "Wrapped BNB", "https://www.binance.org"),
  [97 /* BSC_TESTNET */]: new Token(97 /* BSC_TESTNET */, "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", 18, "WBNB", "Wrapped BNB", "https://www.binance.org")
};
var WNATIVE = {
  [56 /* BSC */]: WBNB[56 /* BSC */],
  [97 /* BSC_TESTNET */]: WBNB[97 /* BSC_TESTNET */],
  [2e3 /* DOGECHAIN */]: WETH9[2e3 /* DOGECHAIN */]
};
var NATIVE = {
  [56 /* BSC */]: {
    name: "Binance Chain Native Token",
    symbol: "BNB",
    decimals: 18
  },
  [97 /* BSC_TESTNET */]: {
    name: "Binance Chain Native Token",
    symbol: "tBNB",
    decimals: 18
  },
  [2e3 /* DOGECHAIN */]: {
    name: "DogeChain Native Token",
    symbol: "DOGE",
    decimals: 18
  }
};

// src/errors.ts
var CAN_SET_PROTOTYPE = "setPrototypeOf" in Object;
var InsufficientReservesError = class extends Error {
  constructor() {
    super();
    this.isInsufficientReservesError = true;
    this.name = this.constructor.name;
    if (CAN_SET_PROTOTYPE)
      Object.setPrototypeOf(this, new.target.prototype);
  }
};
var InsufficientInputAmountError = class extends Error {
  constructor() {
    super();
    this.isInsufficientInputAmountError = true;
    this.name = this.constructor.name;
    if (CAN_SET_PROTOTYPE)
      Object.setPrototypeOf(this, new.target.prototype);
  }
};

// src/entities/pair.ts
import { getCreate2Address } from "@ethersproject/address";
import { keccak256, pack } from "@ethersproject/solidity";
import JSBI7 from "jsbi";
import invariant7 from "tiny-invariant";

// src/entities/fractions/price.ts
import JSBI5 from "jsbi";
import invariant6 from "tiny-invariant";

// src/entities/fractions/fraction.ts
import JSBI3 from "jsbi";
import invariant4 from "tiny-invariant";
import _Decimal from "decimal.js-light";
import _Big from "big.js";
import toFormat from "toformat";
var Decimal = toFormat(_Decimal);
var Big = toFormat(_Big);
var toSignificantRounding = {
  [0 /* ROUND_DOWN */]: Decimal.ROUND_DOWN,
  [1 /* ROUND_HALF_UP */]: Decimal.ROUND_HALF_UP,
  [2 /* ROUND_UP */]: Decimal.ROUND_UP
};
var toFixedRounding = {
  [0 /* ROUND_DOWN */]: 0 /* RoundDown */,
  [1 /* ROUND_HALF_UP */]: 1 /* RoundHalfUp */,
  [2 /* ROUND_UP */]: 3 /* RoundUp */
};
var Fraction = class {
  constructor(numerator, denominator = JSBI3.BigInt(1)) {
    this.numerator = JSBI3.BigInt(numerator);
    this.denominator = JSBI3.BigInt(denominator);
  }
  static tryParseFraction(fractionish) {
    if (fractionish instanceof JSBI3 || typeof fractionish === "number" || typeof fractionish === "string")
      return new Fraction(fractionish);
    if ("numerator" in fractionish && "denominator" in fractionish)
      return fractionish;
    throw new Error("Could not parse fraction");
  }
  get quotient() {
    return JSBI3.divide(this.numerator, this.denominator);
  }
  get remainder() {
    return new Fraction(JSBI3.remainder(this.numerator, this.denominator), this.denominator);
  }
  invert() {
    return new Fraction(this.denominator, this.numerator);
  }
  add(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    if (JSBI3.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI3.add(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(JSBI3.add(JSBI3.multiply(this.numerator, otherParsed.denominator), JSBI3.multiply(otherParsed.numerator, this.denominator)), JSBI3.multiply(this.denominator, otherParsed.denominator));
  }
  subtract(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    if (JSBI3.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(JSBI3.subtract(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(JSBI3.subtract(JSBI3.multiply(this.numerator, otherParsed.denominator), JSBI3.multiply(otherParsed.numerator, this.denominator)), JSBI3.multiply(this.denominator, otherParsed.denominator));
  }
  lessThan(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return JSBI3.lessThan(JSBI3.multiply(this.numerator, otherParsed.denominator), JSBI3.multiply(otherParsed.numerator, this.denominator));
  }
  equalTo(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return JSBI3.equal(JSBI3.multiply(this.numerator, otherParsed.denominator), JSBI3.multiply(otherParsed.numerator, this.denominator));
  }
  greaterThan(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return JSBI3.greaterThan(JSBI3.multiply(this.numerator, otherParsed.denominator), JSBI3.multiply(otherParsed.numerator, this.denominator));
  }
  multiply(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(JSBI3.multiply(this.numerator, otherParsed.numerator), JSBI3.multiply(this.denominator, otherParsed.denominator));
  }
  divide(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(JSBI3.multiply(this.numerator, otherParsed.denominator), JSBI3.multiply(this.denominator, otherParsed.numerator));
  }
  toSignificant(significantDigits, format = { groupSeparator: "" }, rounding = 1 /* ROUND_HALF_UP */) {
    invariant4(Number.isInteger(significantDigits), `${significantDigits} is not an integer.`);
    invariant4(significantDigits > 0, `${significantDigits} is not positive.`);
    Decimal.set({ precision: significantDigits + 1, rounding: toSignificantRounding[rounding] });
    const quotient = new Decimal(this.numerator.toString()).div(this.denominator.toString()).toSignificantDigits(significantDigits);
    return quotient.toFormat(quotient.decimalPlaces(), format);
  }
  toFixed(decimalPlaces, format = { groupSeparator: "" }, rounding = 1 /* ROUND_HALF_UP */) {
    invariant4(Number.isInteger(decimalPlaces), `${decimalPlaces} is not an integer.`);
    invariant4(decimalPlaces >= 0, `${decimalPlaces} is negative.`);
    Big.DP = decimalPlaces;
    Big.RM = toFixedRounding[rounding];
    return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(decimalPlaces, format);
  }
  get asFraction() {
    return new Fraction(this.numerator, this.denominator);
  }
};

// src/entities/fractions/currencyAmount.ts
import invariant5 from "tiny-invariant";
import JSBI4 from "jsbi";
import _Big2 from "big.js";
import toFormat2 from "toformat";
var Big2 = toFormat2(_Big2);
var CurrencyAmount2 = class extends Fraction {
  constructor(currency, numerator, denominator) {
    super(numerator, denominator);
    invariant5(JSBI4.lessThanOrEqual(this.quotient, MaxUint256), "AMOUNT");
    this.currency = currency;
    this.decimalScale = JSBI4.exponentiate(JSBI4.BigInt(10), JSBI4.BigInt(currency.decimals));
  }
  static fromRawAmount(currency, rawAmount) {
    return new CurrencyAmount2(currency, rawAmount);
  }
  static fromFractionalAmount(currency, numerator, denominator) {
    return new CurrencyAmount2(currency, numerator, denominator);
  }
  add(other) {
    invariant5(this.currency.equals(other.currency), "CURRENCY");
    const added = super.add(other);
    return CurrencyAmount2.fromFractionalAmount(this.currency, added.numerator, added.denominator);
  }
  subtract(other) {
    invariant5(this.currency.equals(other.currency), "CURRENCY");
    const subtracted = super.subtract(other);
    return CurrencyAmount2.fromFractionalAmount(this.currency, subtracted.numerator, subtracted.denominator);
  }
  multiply(other) {
    const multiplied = super.multiply(other);
    return CurrencyAmount2.fromFractionalAmount(this.currency, multiplied.numerator, multiplied.denominator);
  }
  divide(other) {
    const divided = super.divide(other);
    return CurrencyAmount2.fromFractionalAmount(this.currency, divided.numerator, divided.denominator);
  }
  toSignificant(significantDigits = 6, format, rounding = 0 /* ROUND_DOWN */) {
    return super.divide(this.decimalScale).toSignificant(significantDigits, format, rounding);
  }
  toFixed(decimalPlaces = this.currency.decimals, format, rounding = 0 /* ROUND_DOWN */) {
    invariant5(decimalPlaces <= this.currency.decimals, "DECIMALS");
    return super.divide(this.decimalScale).toFixed(decimalPlaces, format, rounding);
  }
  toExact(format = { groupSeparator: "" }) {
    Big2.DP = this.currency.decimals;
    return new Big2(this.quotient.toString()).div(this.decimalScale.toString()).toFormat(format);
  }
  get wrapped() {
    if (this.currency.isToken)
      return this;
    return CurrencyAmount2.fromFractionalAmount(this.currency.wrapped, this.numerator, this.denominator);
  }
};

// src/entities/fractions/price.ts
var Price2 = class extends Fraction {
  constructor(...args) {
    let baseCurrency, quoteCurrency, denominator, numerator;
    if (args.length === 4) {
      ;
      [baseCurrency, quoteCurrency, denominator, numerator] = args;
    } else {
      const result = args[0].quoteAmount.divide(args[0].baseAmount);
      [baseCurrency, quoteCurrency, denominator, numerator] = [
        args[0].baseAmount.currency,
        args[0].quoteAmount.currency,
        result.denominator,
        result.numerator
      ];
    }
    super(numerator, denominator);
    this.baseCurrency = baseCurrency;
    this.quoteCurrency = quoteCurrency;
    this.scalar = new Fraction(JSBI5.exponentiate(JSBI5.BigInt(10), JSBI5.BigInt(baseCurrency.decimals)), JSBI5.exponentiate(JSBI5.BigInt(10), JSBI5.BigInt(quoteCurrency.decimals)));
  }
  invert() {
    return new Price2(this.quoteCurrency, this.baseCurrency, this.numerator, this.denominator);
  }
  multiply(other) {
    invariant6(this.quoteCurrency.equals(other.baseCurrency), "TOKEN");
    const fraction = super.multiply(other);
    return new Price2(this.baseCurrency, other.quoteCurrency, fraction.denominator, fraction.numerator);
  }
  quote(currencyAmount) {
    invariant6(currencyAmount.currency.equals(this.baseCurrency), "TOKEN");
    const result = super.multiply(currencyAmount);
    return CurrencyAmount2.fromFractionalAmount(this.quoteCurrency, result.numerator, result.denominator);
  }
  get adjustedForDecimals() {
    return super.multiply(this.scalar);
  }
  toSignificant(significantDigits = 6, format, rounding) {
    return this.adjustedForDecimals.toSignificant(significantDigits, format, rounding);
  }
  toFixed(decimalPlaces = 4, format, rounding) {
    return this.adjustedForDecimals.toFixed(decimalPlaces, format, rounding);
  }
};

// src/entities/fractions/percent.ts
import JSBI6 from "jsbi";
var ONE_HUNDRED = new Fraction(JSBI6.BigInt(100));
function toPercent(fraction) {
  return new Percent(fraction.numerator, fraction.denominator);
}
var Percent = class extends Fraction {
  constructor() {
    super(...arguments);
    this.isPercent = true;
  }
  add(other) {
    return toPercent(super.add(other));
  }
  subtract(other) {
    return toPercent(super.subtract(other));
  }
  multiply(other) {
    return toPercent(super.multiply(other));
  }
  divide(other) {
    return toPercent(super.divide(other));
  }
  toSignificant(significantDigits = 5, format, rounding) {
    return super.multiply(ONE_HUNDRED).toSignificant(significantDigits, format, rounding);
  }
  toFixed(decimalPlaces = 2, format, rounding) {
    return super.multiply(ONE_HUNDRED).toFixed(decimalPlaces, format, rounding);
  }
};

// src/entities/pair.ts
var PAIR_ADDRESS_CACHE = {};
var composeKey = (token0, token1) => `${token0.chainId}-${token0.address}-${token1.address}`;
var computePairAddress = ({
  factoryAddress,
  tokenA,
  tokenB
}) => {
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
  const key = composeKey(token0, token1);
  if ((PAIR_ADDRESS_CACHE == null ? void 0 : PAIR_ADDRESS_CACHE[key]) === void 0) {
    PAIR_ADDRESS_CACHE = {
      ...PAIR_ADDRESS_CACHE,
      [key]: getCreate2Address(factoryAddress, keccak256(["bytes"], [pack(["address", "address"], [token0.address, token1.address])]), INIT_CODE_HASH_MAP[token0.chainId])
    };
  }
  return PAIR_ADDRESS_CACHE[key];
};
var Pair = class {
  static getAddress(tokenA, tokenB) {
    return computePairAddress({ factoryAddress: FACTORY_ADDRESS_MAP[tokenA.chainId], tokenA, tokenB });
  }
  constructor(currencyAmountA, tokenAmountB) {
    const tokenAmounts = currencyAmountA.currency.sortsBefore(tokenAmountB.currency) ? [currencyAmountA, tokenAmountB] : [tokenAmountB, currencyAmountA];
    this.liquidityToken = new Token(tokenAmounts[0].currency.chainId, Pair.getAddress(tokenAmounts[0].currency, tokenAmounts[1].currency), 18, "Wojk-LP", "Wojak LPs");
    this.tokenAmounts = tokenAmounts;
  }
  involvesToken(token) {
    return token.equals(this.token0) || token.equals(this.token1);
  }
  get token0Price() {
    const result = this.tokenAmounts[1].divide(this.tokenAmounts[0]);
    return new Price2(this.token0, this.token1, result.denominator, result.numerator);
  }
  get token1Price() {
    const result = this.tokenAmounts[0].divide(this.tokenAmounts[1]);
    return new Price2(this.token1, this.token0, result.denominator, result.numerator);
  }
  priceOf(token) {
    invariant7(this.involvesToken(token), "TOKEN");
    return token.equals(this.token0) ? this.token0Price : this.token1Price;
  }
  get chainId() {
    return this.token0.chainId;
  }
  get token0() {
    return this.tokenAmounts[0].currency;
  }
  get token1() {
    return this.tokenAmounts[1].currency;
  }
  get reserve0() {
    return this.tokenAmounts[0];
  }
  get reserve1() {
    return this.tokenAmounts[1];
  }
  reserveOf(token) {
    invariant7(this.involvesToken(token), "TOKEN");
    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  }
  getOutputAmount(inputAmount) {
    invariant7(this.involvesToken(inputAmount.currency), "TOKEN");
    if (JSBI7.equal(this.reserve0.quotient, ZERO) || JSBI7.equal(this.reserve1.quotient, ZERO)) {
      throw new InsufficientReservesError();
    }
    const inputReserve = this.reserveOf(inputAmount.currency);
    const outputReserve = this.reserveOf(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    const inputAmountWithFee = JSBI7.multiply(inputAmount.quotient, _9975);
    const numerator = JSBI7.multiply(inputAmountWithFee, outputReserve.quotient);
    const denominator = JSBI7.add(JSBI7.multiply(inputReserve.quotient, _10000), inputAmountWithFee);
    const outputAmount = CurrencyAmount2.fromRawAmount(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0, JSBI7.divide(numerator, denominator));
    if (JSBI7.equal(outputAmount.quotient, ZERO)) {
      throw new InsufficientInputAmountError();
    }
    return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
  }
  getInputAmount(outputAmount) {
    invariant7(this.involvesToken(outputAmount.currency), "TOKEN");
    if (JSBI7.equal(this.reserve0.quotient, ZERO) || JSBI7.equal(this.reserve1.quotient, ZERO) || JSBI7.greaterThanOrEqual(outputAmount.quotient, this.reserveOf(outputAmount.currency).quotient)) {
      throw new InsufficientReservesError();
    }
    const outputReserve = this.reserveOf(outputAmount.currency);
    const inputReserve = this.reserveOf(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    const numerator = JSBI7.multiply(JSBI7.multiply(inputReserve.quotient, outputAmount.quotient), _10000);
    const denominator = JSBI7.multiply(JSBI7.subtract(outputReserve.quotient, outputAmount.quotient), _9975);
    const inputAmount = CurrencyAmount2.fromRawAmount(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0, JSBI7.add(JSBI7.divide(numerator, denominator), ONE));
    return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
  }
  getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB) {
    invariant7(totalSupply.currency.equals(this.liquidityToken), "LIQUIDITY");
    const tokenAmounts = tokenAmountA.currency.sortsBefore(tokenAmountB.currency) ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    invariant7(tokenAmounts[0].currency.equals(this.token0) && tokenAmounts[1].currency.equals(this.token1), "TOKEN");
    let liquidity;
    if (JSBI7.equal(totalSupply.quotient, ZERO)) {
      liquidity = JSBI7.subtract(sqrt(JSBI7.multiply(tokenAmounts[0].quotient, tokenAmounts[1].quotient)), MINIMUM_LIQUIDITY);
    } else {
      const amount0 = JSBI7.divide(JSBI7.multiply(tokenAmounts[0].quotient, totalSupply.quotient), this.reserve0.quotient);
      const amount1 = JSBI7.divide(JSBI7.multiply(tokenAmounts[1].quotient, totalSupply.quotient), this.reserve1.quotient);
      liquidity = JSBI7.lessThanOrEqual(amount0, amount1) ? amount0 : amount1;
    }
    if (!JSBI7.greaterThan(liquidity, ZERO)) {
      throw new InsufficientInputAmountError();
    }
    return CurrencyAmount2.fromRawAmount(this.liquidityToken, liquidity);
  }
  getLiquidityValue(token, totalSupply, liquidity, feeOn = false, kLast) {
    invariant7(this.involvesToken(token), "TOKEN");
    invariant7(totalSupply.currency.equals(this.liquidityToken), "TOTAL_SUPPLY");
    invariant7(liquidity.currency.equals(this.liquidityToken), "LIQUIDITY");
    invariant7(JSBI7.lessThanOrEqual(liquidity.quotient, totalSupply.quotient), "LIQUIDITY");
    let totalSupplyAdjusted;
    if (!feeOn) {
      totalSupplyAdjusted = totalSupply;
    } else {
      invariant7(!!kLast, "K_LAST");
      const kLastParsed = JSBI7.BigInt(kLast);
      if (!JSBI7.equal(kLastParsed, ZERO)) {
        const rootK = sqrt(JSBI7.multiply(this.reserve0.quotient, this.reserve1.quotient));
        const rootKLast = sqrt(kLastParsed);
        if (JSBI7.greaterThan(rootK, rootKLast)) {
          const numerator = JSBI7.multiply(totalSupply.quotient, JSBI7.subtract(rootK, rootKLast));
          const denominator = JSBI7.add(JSBI7.multiply(rootK, FIVE), rootKLast);
          const feeLiquidity = JSBI7.divide(numerator, denominator);
          totalSupplyAdjusted = totalSupply.add(CurrencyAmount2.fromRawAmount(this.liquidityToken, feeLiquidity));
        } else {
          totalSupplyAdjusted = totalSupply;
        }
      } else {
        totalSupplyAdjusted = totalSupply;
      }
    }
    return CurrencyAmount2.fromRawAmount(token, JSBI7.divide(JSBI7.multiply(liquidity.quotient, this.reserveOf(token).quotient), totalSupplyAdjusted.quotient));
  }
};

// src/entities/route.ts
import invariant8 from "tiny-invariant";
var Route = class {
  constructor(pairs, input, output) {
    this._midPrice = null;
    invariant8(pairs.length > 0, "PAIRS");
    const chainId = pairs[0].chainId;
    invariant8(pairs.every((pair) => pair.chainId === chainId), "CHAIN_IDS");
    const wrappedInput = input.wrapped;
    invariant8(pairs[0].involvesToken(wrappedInput), "INPUT");
    invariant8(typeof output === "undefined" || pairs[pairs.length - 1].involvesToken(output.wrapped), "OUTPUT");
    const path = [wrappedInput];
    for (const [i, pair] of pairs.entries()) {
      const currentInput = path[i];
      invariant8(currentInput.equals(pair.token0) || currentInput.equals(pair.token1), "PATH");
      const output2 = currentInput.equals(pair.token0) ? pair.token1 : pair.token0;
      path.push(output2);
    }
    this.pairs = pairs;
    this.path = path;
    this.input = input;
    this.output = output;
  }
  get midPrice() {
    if (this._midPrice !== null)
      return this._midPrice;
    const prices = [];
    for (const [i, pair] of this.pairs.entries()) {
      prices.push(this.path[i].equals(pair.token0) ? new Price2(pair.reserve0.currency, pair.reserve1.currency, pair.reserve0.quotient, pair.reserve1.quotient) : new Price2(pair.reserve1.currency, pair.reserve0.currency, pair.reserve1.quotient, pair.reserve0.quotient));
    }
    const reduced = prices.slice(1).reduce((accumulator, currentValue) => accumulator.multiply(currentValue), prices[0]);
    return this._midPrice = new Price2(this.input, this.output, reduced.denominator, reduced.numerator);
  }
  get chainId() {
    return this.pairs[0].chainId;
  }
};

// src/entities/trade.ts
import invariant9 from "tiny-invariant";
function inputOutputComparator(a, b) {
  invariant9(a.inputAmount.currency.equals(b.inputAmount.currency), "INPUT_CURRENCY");
  invariant9(a.outputAmount.currency.equals(b.outputAmount.currency), "OUTPUT_CURRENCY");
  if (a.outputAmount.equalTo(b.outputAmount)) {
    if (a.inputAmount.equalTo(b.inputAmount)) {
      return 0;
    }
    if (a.inputAmount.lessThan(b.inputAmount)) {
      return -1;
    } else {
      return 1;
    }
  } else {
    if (a.outputAmount.lessThan(b.outputAmount)) {
      return 1;
    } else {
      return -1;
    }
  }
}
function tradeComparator(a, b) {
  const ioComp = inputOutputComparator(a, b);
  if (ioComp !== 0) {
    return ioComp;
  }
  if (a.priceImpact.lessThan(b.priceImpact)) {
    return -1;
  } else if (a.priceImpact.greaterThan(b.priceImpact)) {
    return 1;
  }
  return a.route.path.length - b.route.path.length;
}
var Trade = class {
  static exactIn(route, amountIn) {
    return new Trade(route, amountIn, 0 /* EXACT_INPUT */);
  }
  static exactOut(route, amountOut) {
    return new Trade(route, amountOut, 1 /* EXACT_OUTPUT */);
  }
  constructor(route, amount, tradeType) {
    this.route = route;
    this.tradeType = tradeType;
    const tokenAmounts = new Array(route.path.length);
    if (tradeType === 0 /* EXACT_INPUT */) {
      invariant9(amount.currency.equals(route.input), "INPUT");
      tokenAmounts[0] = amount.wrapped;
      for (let i = 0; i < route.path.length - 1; i++) {
        const pair = route.pairs[i];
        const [outputAmount] = pair.getOutputAmount(tokenAmounts[i]);
        tokenAmounts[i + 1] = outputAmount;
      }
      this.inputAmount = CurrencyAmount2.fromFractionalAmount(route.input, amount.numerator, amount.denominator);
      this.outputAmount = CurrencyAmount2.fromFractionalAmount(route.output, tokenAmounts[tokenAmounts.length - 1].numerator, tokenAmounts[tokenAmounts.length - 1].denominator);
    } else {
      invariant9(amount.currency.equals(route.output), "OUTPUT");
      tokenAmounts[tokenAmounts.length - 1] = amount.wrapped;
      for (let i = route.path.length - 1; i > 0; i--) {
        const pair = route.pairs[i - 1];
        const [inputAmount] = pair.getInputAmount(tokenAmounts[i]);
        tokenAmounts[i - 1] = inputAmount;
      }
      this.inputAmount = CurrencyAmount2.fromFractionalAmount(route.input, tokenAmounts[0].numerator, tokenAmounts[0].denominator);
      this.outputAmount = CurrencyAmount2.fromFractionalAmount(route.output, amount.numerator, amount.denominator);
    }
    this.executionPrice = new Price2(this.inputAmount.currency, this.outputAmount.currency, this.inputAmount.quotient, this.outputAmount.quotient);
    this.priceImpact = computePriceImpact(route.midPrice, this.inputAmount, this.outputAmount);
  }
  minimumAmountOut(slippageTolerance) {
    invariant9(!slippageTolerance.lessThan(ZERO), "SLIPPAGE_TOLERANCE");
    if (this.tradeType === 1 /* EXACT_OUTPUT */) {
      return this.outputAmount;
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE).add(slippageTolerance).invert().multiply(this.outputAmount.quotient).quotient;
      return CurrencyAmount2.fromRawAmount(this.outputAmount.currency, slippageAdjustedAmountOut);
    }
  }
  maximumAmountIn(slippageTolerance) {
    invariant9(!slippageTolerance.lessThan(ZERO), "SLIPPAGE_TOLERANCE");
    if (this.tradeType === 0 /* EXACT_INPUT */) {
      return this.inputAmount;
    } else {
      const slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.quotient).quotient;
      return CurrencyAmount2.fromRawAmount(this.inputAmount.currency, slippageAdjustedAmountIn);
    }
  }
  static bestTradeExactIn(pairs, currencyAmountIn, currencyOut, { maxNumResults = 3, maxHops = 3 } = {}, currentPairs = [], nextAmountIn = currencyAmountIn, bestTrades = []) {
    invariant9(pairs.length > 0, "PAIRS");
    invariant9(maxHops > 0, "MAX_HOPS");
    invariant9(currencyAmountIn === nextAmountIn || currentPairs.length > 0, "INVALID_RECURSION");
    const amountIn = nextAmountIn.wrapped;
    const tokenOut = currencyOut.wrapped;
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      if (!pair.token0.equals(amountIn.currency) && !pair.token1.equals(amountIn.currency))
        continue;
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO))
        continue;
      let amountOut;
      try {
        ;
        [amountOut] = pair.getOutputAmount(amountIn);
      } catch (error) {
        if (error.isInsufficientInputAmountError) {
          continue;
        }
        throw error;
      }
      if (amountOut.currency.equals(tokenOut)) {
        sortedInsert(bestTrades, new Trade(new Route([...currentPairs, pair], currencyAmountIn.currency, currencyOut), currencyAmountIn, 0 /* EXACT_INPUT */), maxNumResults, tradeComparator);
      } else if (maxHops > 1 && pairs.length > 1) {
        const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length));
        Trade.bestTradeExactIn(pairsExcludingThisPair, currencyAmountIn, currencyOut, {
          maxNumResults,
          maxHops: maxHops - 1
        }, [...currentPairs, pair], amountOut, bestTrades);
      }
    }
    return bestTrades;
  }
  worstExecutionPrice(slippageTolerance) {
    return new Price2(this.inputAmount.currency, this.outputAmount.currency, this.maximumAmountIn(slippageTolerance).quotient, this.minimumAmountOut(slippageTolerance).quotient);
  }
  static bestTradeExactOut(pairs, currencyIn, currencyAmountOut, { maxNumResults = 3, maxHops = 3 } = {}, currentPairs = [], nextAmountOut = currencyAmountOut, bestTrades = []) {
    invariant9(pairs.length > 0, "PAIRS");
    invariant9(maxHops > 0, "MAX_HOPS");
    invariant9(currencyAmountOut === nextAmountOut || currentPairs.length > 0, "INVALID_RECURSION");
    const amountOut = nextAmountOut.wrapped;
    const tokenIn = currencyIn.wrapped;
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      if (!pair.token0.equals(amountOut.currency) && !pair.token1.equals(amountOut.currency))
        continue;
      if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO))
        continue;
      let amountIn;
      try {
        ;
        [amountIn] = pair.getInputAmount(amountOut);
      } catch (error) {
        if (error.isInsufficientReservesError) {
          continue;
        }
        throw error;
      }
      if (amountIn.currency.equals(tokenIn)) {
        sortedInsert(bestTrades, new Trade(new Route([pair, ...currentPairs], currencyIn, currencyAmountOut.currency), currencyAmountOut, 1 /* EXACT_OUTPUT */), maxNumResults, tradeComparator);
      } else if (maxHops > 1 && pairs.length > 1) {
        const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length));
        Trade.bestTradeExactOut(pairsExcludingThisPair, currencyIn, currencyAmountOut, {
          maxNumResults,
          maxHops: maxHops - 1
        }, [pair, ...currentPairs], amountIn, bestTrades);
      }
    }
    return bestTrades;
  }
};

// src/entities/nativeCurrency.ts
var NativeCurrency = class extends BaseCurrency {
  constructor() {
    super(...arguments);
    this.isNative = true;
    this.isToken = false;
  }
};

// src/entities/native.ts
import invariant10 from "tiny-invariant";
var _Native = class extends NativeCurrency {
  constructor({
    chainId,
    decimals,
    name,
    symbol
  }) {
    super(chainId, decimals, symbol, name);
  }
  get wrapped() {
    const wnative = WNATIVE[this.chainId];
    invariant10(!!wnative, "WRAPPED");
    return wnative;
  }
  static onChain(chainId) {
    if (chainId in this.cache) {
      return this.cache[chainId];
    }
    invariant10(!!NATIVE[chainId], "NATIVE_CURRENCY");
    const { decimals, name, symbol } = NATIVE[chainId];
    return this.cache[chainId] = new _Native({ chainId, decimals, symbol, name });
  }
  equals(other) {
    return other.isNative && other.chainId === this.chainId;
  }
};
var Native = _Native;
Native.cache = {};

// src/router.ts
import invariant11 from "tiny-invariant";
function toHex(currencyAmount) {
  return `0x${currencyAmount.quotient.toString(16)}`;
}
var ZERO_HEX = "0x0";
var Router = class {
  constructor() {
  }
  static swapCallParameters(trade, options) {
    const etherIn = trade.inputAmount.currency.isNative;
    const etherOut = trade.outputAmount.currency.isNative;
    invariant11(!(etherIn && etherOut), "ETHER_IN_OUT");
    invariant11(!("ttl" in options) || options.ttl > 0, "TTL");
    const to = validateAndParseAddress(options.recipient);
    const amountIn = toHex(trade.maximumAmountIn(options.allowedSlippage));
    const amountOut = toHex(trade.minimumAmountOut(options.allowedSlippage));
    const path = trade.route.path.map((token) => token.address);
    const deadline = "ttl" in options ? `0x${(Math.floor(new Date().getTime() / 1e3) + options.ttl).toString(16)}` : `0x${options.deadline.toString(16)}`;
    const useFeeOnTransfer = Boolean(options.feeOnTransfer);
    let methodName;
    let args;
    let value;
    switch (trade.tradeType) {
      case 0 /* EXACT_INPUT */:
        if (etherIn) {
          methodName = useFeeOnTransfer ? "swapExactETHForTokensSupportingFeeOnTransferTokens" : "swapExactETHForTokens";
          args = [amountOut, path, to, deadline];
          value = amountIn;
        } else if (etherOut) {
          methodName = useFeeOnTransfer ? "swapExactTokensForETHSupportingFeeOnTransferTokens" : "swapExactTokensForETH";
          args = [amountIn, amountOut, path, to, deadline];
          value = ZERO_HEX;
        } else {
          methodName = useFeeOnTransfer ? "swapExactTokensForTokensSupportingFeeOnTransferTokens" : "swapExactTokensForTokens";
          args = [amountIn, amountOut, path, to, deadline];
          value = ZERO_HEX;
        }
        break;
      case 1 /* EXACT_OUTPUT */:
        invariant11(!useFeeOnTransfer, "EXACT_OUT_FOT");
        if (etherIn) {
          methodName = "swapETHForExactTokens";
          args = [amountOut, path, to, deadline];
          value = amountIn;
        } else if (etherOut) {
          methodName = "swapTokensForExactETH";
          args = [amountOut, amountIn, path, to, deadline];
          value = ZERO_HEX;
        } else {
          methodName = "swapTokensForExactTokens";
          args = [amountOut, amountIn, path, to, deadline];
          value = ZERO_HEX;
        }
        break;
    }
    return {
      methodName,
      args,
      value
    };
  }
};
export {
  BaseCurrency,
  ChainId,
  CurrencyAmount2 as CurrencyAmount,
  FACTORY_ADDRESS_BSC,
  FACTORY_ADDRESS_BSC_TESTNET,
  FACTORY_ADDRESS_DC,
  FACTORY_ADDRESS_MAP,
  FIVE,
  Fraction,
  INIT_CODE_HASH_BSC,
  INIT_CODE_HASH_BSC_TESTNET,
  INIT_CODE_HASH_DC,
  INIT_CODE_HASH_MAP,
  InsufficientInputAmountError,
  InsufficientReservesError,
  JSBI8 as JSBI,
  MINIMUM_LIQUIDITY,
  MaxUint256,
  NATIVE,
  Native,
  NativeCurrency,
  ONE,
  Pair,
  Percent,
  Price2 as Price,
  Rounding,
  Route,
  Router,
  SOLIDITY_TYPE_MAXIMA,
  SolidityType,
  TEN,
  THREE,
  TWO,
  Token,
  Trade,
  TradeType,
  WBNB,
  WETH9,
  WNATIVE,
  ZERO,
  _100,
  _10000,
  _9975,
  computePairAddress,
  computePriceImpact,
  inputOutputComparator,
  tradeComparator
};
