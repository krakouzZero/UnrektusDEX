"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  BaseCurrency: () => BaseCurrency,
  ChainId: () => ChainId,
  CurrencyAmount: () => CurrencyAmount2,
  FACTORY_ADDRESS_BSC: () => FACTORY_ADDRESS_BSC,
  FACTORY_ADDRESS_BSC_TESTNET: () => FACTORY_ADDRESS_BSC_TESTNET,
  FACTORY_ADDRESS_DC: () => FACTORY_ADDRESS_DC,
  FACTORY_ADDRESS_MAP: () => FACTORY_ADDRESS_MAP,
  FIVE: () => FIVE,
  Fraction: () => Fraction,
  INIT_CODE_HASH_BSC: () => INIT_CODE_HASH_BSC,
  INIT_CODE_HASH_BSC_TESTNET: () => INIT_CODE_HASH_BSC_TESTNET,
  INIT_CODE_HASH_DC: () => INIT_CODE_HASH_DC,
  INIT_CODE_HASH_MAP: () => INIT_CODE_HASH_MAP,
  InsufficientInputAmountError: () => InsufficientInputAmountError,
  InsufficientReservesError: () => InsufficientReservesError,
  JSBI: () => import_jsbi8.default,
  MINIMUM_LIQUIDITY: () => MINIMUM_LIQUIDITY,
  MaxUint256: () => MaxUint256,
  NATIVE: () => NATIVE,
  Native: () => Native,
  NativeCurrency: () => NativeCurrency,
  ONE: () => ONE,
  Pair: () => Pair,
  Percent: () => Percent,
  Price: () => Price2,
  Rounding: () => Rounding,
  Route: () => Route,
  Router: () => Router,
  SOLIDITY_TYPE_MAXIMA: () => SOLIDITY_TYPE_MAXIMA,
  SolidityType: () => SolidityType,
  TEN: () => TEN,
  THREE: () => THREE,
  TWO: () => TWO,
  Token: () => Token,
  Trade: () => Trade,
  TradeType: () => TradeType,
  WBNB: () => WBNB,
  WETH9: () => WETH9,
  WNATIVE: () => WNATIVE,
  ZERO: () => ZERO,
  _100: () => _100,
  _10000: () => _10000,
  _9975: () => _9975,
  computePairAddress: () => computePairAddress,
  computePriceImpact: () => computePriceImpact,
  inputOutputComparator: () => inputOutputComparator,
  tradeComparator: () => tradeComparator
});
module.exports = __toCommonJS(src_exports);
var import_jsbi8 = __toESM(require("jsbi"));

// src/constants.ts
var import_jsbi2 = __toESM(require("jsbi"));

// src/entities/token.ts
var import_tiny_invariant3 = __toESM(require("tiny-invariant"));

// src/utils.ts
var import_tiny_invariant = __toESM(require("tiny-invariant"));
var import_tiny_warning = __toESM(require("tiny-warning"));
var import_jsbi = __toESM(require("jsbi"));
var import_address = require("@ethersproject/address");
function validateSolidityTypeInstance(value, solidityType) {
  (0, import_tiny_invariant.default)(import_jsbi.default.greaterThanOrEqual(value, ZERO), `${value} is not a ${solidityType}.`);
  (0, import_tiny_invariant.default)(import_jsbi.default.lessThanOrEqual(value, SOLIDITY_TYPE_MAXIMA[solidityType]), `${value} is not a ${solidityType}.`);
}
function validateAndParseAddress(address) {
  try {
    const checksummedAddress = (0, import_address.getAddress)(address);
    (0, import_tiny_warning.default)(address === checksummedAddress, `${address} is not checksummed.`);
    return checksummedAddress;
  } catch (error) {
    (0, import_tiny_invariant.default)(false, `${address} is not a valid address.`);
  }
}
function sqrt(y) {
  validateSolidityTypeInstance(y, "uint256" /* uint256 */);
  let z = ZERO;
  let x;
  if (import_jsbi.default.greaterThan(y, THREE)) {
    z = y;
    x = import_jsbi.default.add(import_jsbi.default.divide(y, TWO), ONE);
    while (import_jsbi.default.lessThan(x, z)) {
      z = x;
      x = import_jsbi.default.divide(import_jsbi.default.add(import_jsbi.default.divide(y, x), x), TWO);
    }
  } else if (import_jsbi.default.notEqual(y, ZERO)) {
    z = ONE;
  }
  return z;
}
function sortedInsert(items, add, maxSize, comparator) {
  (0, import_tiny_invariant.default)(maxSize > 0, "MAX_SIZE_ZERO");
  (0, import_tiny_invariant.default)(items.length <= maxSize, "ITEMS_SIZE");
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
var import_tiny_invariant2 = __toESM(require("tiny-invariant"));
var BaseCurrency = class {
  constructor(chainId, decimals, symbol, name) {
    (0, import_tiny_invariant2.default)(Number.isSafeInteger(chainId), "CHAIN_ID");
    (0, import_tiny_invariant2.default)(decimals >= 0 && decimals < 255 && Number.isInteger(decimals), "DECIMALS");
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
    (0, import_tiny_invariant3.default)(this.chainId === other.chainId, "CHAIN_IDS");
    (0, import_tiny_invariant3.default)(this.address !== other.address, "ADDRESSES");
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
var MINIMUM_LIQUIDITY = import_jsbi2.default.BigInt(1e3);
var ZERO = import_jsbi2.default.BigInt(0);
var ONE = import_jsbi2.default.BigInt(1);
var TWO = import_jsbi2.default.BigInt(2);
var THREE = import_jsbi2.default.BigInt(3);
var FIVE = import_jsbi2.default.BigInt(5);
var TEN = import_jsbi2.default.BigInt(10);
var _100 = import_jsbi2.default.BigInt(100);
var _9975 = import_jsbi2.default.BigInt(9975);
var _10000 = import_jsbi2.default.BigInt(1e4);
var MaxUint256 = import_jsbi2.default.BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
var SolidityType = /* @__PURE__ */ ((SolidityType2) => {
  SolidityType2["uint8"] = "uint8";
  SolidityType2["uint256"] = "uint256";
  return SolidityType2;
})(SolidityType || {});
var SOLIDITY_TYPE_MAXIMA = {
  ["uint8" /* uint8 */]: import_jsbi2.default.BigInt("0xff"),
  ["uint256" /* uint256 */]: import_jsbi2.default.BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
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
var import_address2 = require("@ethersproject/address");
var import_solidity = require("@ethersproject/solidity");
var import_jsbi7 = __toESM(require("jsbi"));
var import_tiny_invariant7 = __toESM(require("tiny-invariant"));

// src/entities/fractions/price.ts
var import_jsbi5 = __toESM(require("jsbi"));
var import_tiny_invariant6 = __toESM(require("tiny-invariant"));

// src/entities/fractions/fraction.ts
var import_jsbi3 = __toESM(require("jsbi"));
var import_tiny_invariant4 = __toESM(require("tiny-invariant"));
var import_decimal = __toESM(require("decimal.js-light"));
var import_big = __toESM(require("big.js"));
var import_toformat = __toESM(require("toformat"));
var Decimal = (0, import_toformat.default)(import_decimal.default);
var Big = (0, import_toformat.default)(import_big.default);
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
  constructor(numerator, denominator = import_jsbi3.default.BigInt(1)) {
    this.numerator = import_jsbi3.default.BigInt(numerator);
    this.denominator = import_jsbi3.default.BigInt(denominator);
  }
  static tryParseFraction(fractionish) {
    if (fractionish instanceof import_jsbi3.default || typeof fractionish === "number" || typeof fractionish === "string")
      return new Fraction(fractionish);
    if ("numerator" in fractionish && "denominator" in fractionish)
      return fractionish;
    throw new Error("Could not parse fraction");
  }
  get quotient() {
    return import_jsbi3.default.divide(this.numerator, this.denominator);
  }
  get remainder() {
    return new Fraction(import_jsbi3.default.remainder(this.numerator, this.denominator), this.denominator);
  }
  invert() {
    return new Fraction(this.denominator, this.numerator);
  }
  add(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    if (import_jsbi3.default.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(import_jsbi3.default.add(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(import_jsbi3.default.add(import_jsbi3.default.multiply(this.numerator, otherParsed.denominator), import_jsbi3.default.multiply(otherParsed.numerator, this.denominator)), import_jsbi3.default.multiply(this.denominator, otherParsed.denominator));
  }
  subtract(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    if (import_jsbi3.default.equal(this.denominator, otherParsed.denominator)) {
      return new Fraction(import_jsbi3.default.subtract(this.numerator, otherParsed.numerator), this.denominator);
    }
    return new Fraction(import_jsbi3.default.subtract(import_jsbi3.default.multiply(this.numerator, otherParsed.denominator), import_jsbi3.default.multiply(otherParsed.numerator, this.denominator)), import_jsbi3.default.multiply(this.denominator, otherParsed.denominator));
  }
  lessThan(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return import_jsbi3.default.lessThan(import_jsbi3.default.multiply(this.numerator, otherParsed.denominator), import_jsbi3.default.multiply(otherParsed.numerator, this.denominator));
  }
  equalTo(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return import_jsbi3.default.equal(import_jsbi3.default.multiply(this.numerator, otherParsed.denominator), import_jsbi3.default.multiply(otherParsed.numerator, this.denominator));
  }
  greaterThan(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return import_jsbi3.default.greaterThan(import_jsbi3.default.multiply(this.numerator, otherParsed.denominator), import_jsbi3.default.multiply(otherParsed.numerator, this.denominator));
  }
  multiply(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(import_jsbi3.default.multiply(this.numerator, otherParsed.numerator), import_jsbi3.default.multiply(this.denominator, otherParsed.denominator));
  }
  divide(other) {
    const otherParsed = Fraction.tryParseFraction(other);
    return new Fraction(import_jsbi3.default.multiply(this.numerator, otherParsed.denominator), import_jsbi3.default.multiply(this.denominator, otherParsed.numerator));
  }
  toSignificant(significantDigits, format = { groupSeparator: "" }, rounding = 1 /* ROUND_HALF_UP */) {
    (0, import_tiny_invariant4.default)(Number.isInteger(significantDigits), `${significantDigits} is not an integer.`);
    (0, import_tiny_invariant4.default)(significantDigits > 0, `${significantDigits} is not positive.`);
    Decimal.set({ precision: significantDigits + 1, rounding: toSignificantRounding[rounding] });
    const quotient = new Decimal(this.numerator.toString()).div(this.denominator.toString()).toSignificantDigits(significantDigits);
    return quotient.toFormat(quotient.decimalPlaces(), format);
  }
  toFixed(decimalPlaces, format = { groupSeparator: "" }, rounding = 1 /* ROUND_HALF_UP */) {
    (0, import_tiny_invariant4.default)(Number.isInteger(decimalPlaces), `${decimalPlaces} is not an integer.`);
    (0, import_tiny_invariant4.default)(decimalPlaces >= 0, `${decimalPlaces} is negative.`);
    Big.DP = decimalPlaces;
    Big.RM = toFixedRounding[rounding];
    return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(decimalPlaces, format);
  }
  get asFraction() {
    return new Fraction(this.numerator, this.denominator);
  }
};

// src/entities/fractions/currencyAmount.ts
var import_tiny_invariant5 = __toESM(require("tiny-invariant"));
var import_jsbi4 = __toESM(require("jsbi"));
var import_big2 = __toESM(require("big.js"));
var import_toformat2 = __toESM(require("toformat"));
var Big2 = (0, import_toformat2.default)(import_big2.default);
var CurrencyAmount2 = class extends Fraction {
  constructor(currency, numerator, denominator) {
    super(numerator, denominator);
    (0, import_tiny_invariant5.default)(import_jsbi4.default.lessThanOrEqual(this.quotient, MaxUint256), "AMOUNT");
    this.currency = currency;
    this.decimalScale = import_jsbi4.default.exponentiate(import_jsbi4.default.BigInt(10), import_jsbi4.default.BigInt(currency.decimals));
  }
  static fromRawAmount(currency, rawAmount) {
    return new CurrencyAmount2(currency, rawAmount);
  }
  static fromFractionalAmount(currency, numerator, denominator) {
    return new CurrencyAmount2(currency, numerator, denominator);
  }
  add(other) {
    (0, import_tiny_invariant5.default)(this.currency.equals(other.currency), "CURRENCY");
    const added = super.add(other);
    return CurrencyAmount2.fromFractionalAmount(this.currency, added.numerator, added.denominator);
  }
  subtract(other) {
    (0, import_tiny_invariant5.default)(this.currency.equals(other.currency), "CURRENCY");
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
    (0, import_tiny_invariant5.default)(decimalPlaces <= this.currency.decimals, "DECIMALS");
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
    this.scalar = new Fraction(import_jsbi5.default.exponentiate(import_jsbi5.default.BigInt(10), import_jsbi5.default.BigInt(baseCurrency.decimals)), import_jsbi5.default.exponentiate(import_jsbi5.default.BigInt(10), import_jsbi5.default.BigInt(quoteCurrency.decimals)));
  }
  invert() {
    return new Price2(this.quoteCurrency, this.baseCurrency, this.numerator, this.denominator);
  }
  multiply(other) {
    (0, import_tiny_invariant6.default)(this.quoteCurrency.equals(other.baseCurrency), "TOKEN");
    const fraction = super.multiply(other);
    return new Price2(this.baseCurrency, other.quoteCurrency, fraction.denominator, fraction.numerator);
  }
  quote(currencyAmount) {
    (0, import_tiny_invariant6.default)(currencyAmount.currency.equals(this.baseCurrency), "TOKEN");
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
var import_jsbi6 = __toESM(require("jsbi"));
var ONE_HUNDRED = new Fraction(import_jsbi6.default.BigInt(100));
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
      [key]: (0, import_address2.getCreate2Address)(factoryAddress, (0, import_solidity.keccak256)(["bytes"], [(0, import_solidity.pack)(["address", "address"], [token0.address, token1.address])]), INIT_CODE_HASH_MAP[token0.chainId])
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
    (0, import_tiny_invariant7.default)(this.involvesToken(token), "TOKEN");
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
    (0, import_tiny_invariant7.default)(this.involvesToken(token), "TOKEN");
    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  }
  getOutputAmount(inputAmount) {
    (0, import_tiny_invariant7.default)(this.involvesToken(inputAmount.currency), "TOKEN");
    if (import_jsbi7.default.equal(this.reserve0.quotient, ZERO) || import_jsbi7.default.equal(this.reserve1.quotient, ZERO)) {
      throw new InsufficientReservesError();
    }
    const inputReserve = this.reserveOf(inputAmount.currency);
    const outputReserve = this.reserveOf(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    const inputAmountWithFee = import_jsbi7.default.multiply(inputAmount.quotient, _9975);
    const numerator = import_jsbi7.default.multiply(inputAmountWithFee, outputReserve.quotient);
    const denominator = import_jsbi7.default.add(import_jsbi7.default.multiply(inputReserve.quotient, _10000), inputAmountWithFee);
    const outputAmount = CurrencyAmount2.fromRawAmount(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0, import_jsbi7.default.divide(numerator, denominator));
    if (import_jsbi7.default.equal(outputAmount.quotient, ZERO)) {
      throw new InsufficientInputAmountError();
    }
    return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
  }
  getInputAmount(outputAmount) {
    (0, import_tiny_invariant7.default)(this.involvesToken(outputAmount.currency), "TOKEN");
    if (import_jsbi7.default.equal(this.reserve0.quotient, ZERO) || import_jsbi7.default.equal(this.reserve1.quotient, ZERO) || import_jsbi7.default.greaterThanOrEqual(outputAmount.quotient, this.reserveOf(outputAmount.currency).quotient)) {
      throw new InsufficientReservesError();
    }
    const outputReserve = this.reserveOf(outputAmount.currency);
    const inputReserve = this.reserveOf(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    const numerator = import_jsbi7.default.multiply(import_jsbi7.default.multiply(inputReserve.quotient, outputAmount.quotient), _10000);
    const denominator = import_jsbi7.default.multiply(import_jsbi7.default.subtract(outputReserve.quotient, outputAmount.quotient), _9975);
    const inputAmount = CurrencyAmount2.fromRawAmount(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0, import_jsbi7.default.add(import_jsbi7.default.divide(numerator, denominator), ONE));
    return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))];
  }
  getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB) {
    (0, import_tiny_invariant7.default)(totalSupply.currency.equals(this.liquidityToken), "LIQUIDITY");
    const tokenAmounts = tokenAmountA.currency.sortsBefore(tokenAmountB.currency) ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    (0, import_tiny_invariant7.default)(tokenAmounts[0].currency.equals(this.token0) && tokenAmounts[1].currency.equals(this.token1), "TOKEN");
    let liquidity;
    if (import_jsbi7.default.equal(totalSupply.quotient, ZERO)) {
      liquidity = import_jsbi7.default.subtract(sqrt(import_jsbi7.default.multiply(tokenAmounts[0].quotient, tokenAmounts[1].quotient)), MINIMUM_LIQUIDITY);
    } else {
      const amount0 = import_jsbi7.default.divide(import_jsbi7.default.multiply(tokenAmounts[0].quotient, totalSupply.quotient), this.reserve0.quotient);
      const amount1 = import_jsbi7.default.divide(import_jsbi7.default.multiply(tokenAmounts[1].quotient, totalSupply.quotient), this.reserve1.quotient);
      liquidity = import_jsbi7.default.lessThanOrEqual(amount0, amount1) ? amount0 : amount1;
    }
    if (!import_jsbi7.default.greaterThan(liquidity, ZERO)) {
      throw new InsufficientInputAmountError();
    }
    return CurrencyAmount2.fromRawAmount(this.liquidityToken, liquidity);
  }
  getLiquidityValue(token, totalSupply, liquidity, feeOn = false, kLast) {
    (0, import_tiny_invariant7.default)(this.involvesToken(token), "TOKEN");
    (0, import_tiny_invariant7.default)(totalSupply.currency.equals(this.liquidityToken), "TOTAL_SUPPLY");
    (0, import_tiny_invariant7.default)(liquidity.currency.equals(this.liquidityToken), "LIQUIDITY");
    (0, import_tiny_invariant7.default)(import_jsbi7.default.lessThanOrEqual(liquidity.quotient, totalSupply.quotient), "LIQUIDITY");
    let totalSupplyAdjusted;
    if (!feeOn) {
      totalSupplyAdjusted = totalSupply;
    } else {
      (0, import_tiny_invariant7.default)(!!kLast, "K_LAST");
      const kLastParsed = import_jsbi7.default.BigInt(kLast);
      if (!import_jsbi7.default.equal(kLastParsed, ZERO)) {
        const rootK = sqrt(import_jsbi7.default.multiply(this.reserve0.quotient, this.reserve1.quotient));
        const rootKLast = sqrt(kLastParsed);
        if (import_jsbi7.default.greaterThan(rootK, rootKLast)) {
          const numerator = import_jsbi7.default.multiply(totalSupply.quotient, import_jsbi7.default.subtract(rootK, rootKLast));
          const denominator = import_jsbi7.default.add(import_jsbi7.default.multiply(rootK, FIVE), rootKLast);
          const feeLiquidity = import_jsbi7.default.divide(numerator, denominator);
          totalSupplyAdjusted = totalSupply.add(CurrencyAmount2.fromRawAmount(this.liquidityToken, feeLiquidity));
        } else {
          totalSupplyAdjusted = totalSupply;
        }
      } else {
        totalSupplyAdjusted = totalSupply;
      }
    }
    return CurrencyAmount2.fromRawAmount(token, import_jsbi7.default.divide(import_jsbi7.default.multiply(liquidity.quotient, this.reserveOf(token).quotient), totalSupplyAdjusted.quotient));
  }
};

// src/entities/route.ts
var import_tiny_invariant8 = __toESM(require("tiny-invariant"));
var Route = class {
  constructor(pairs, input, output) {
    this._midPrice = null;
    (0, import_tiny_invariant8.default)(pairs.length > 0, "PAIRS");
    const chainId = pairs[0].chainId;
    (0, import_tiny_invariant8.default)(pairs.every((pair) => pair.chainId === chainId), "CHAIN_IDS");
    const wrappedInput = input.wrapped;
    (0, import_tiny_invariant8.default)(pairs[0].involvesToken(wrappedInput), "INPUT");
    (0, import_tiny_invariant8.default)(typeof output === "undefined" || pairs[pairs.length - 1].involvesToken(output.wrapped), "OUTPUT");
    const path = [wrappedInput];
    for (const [i, pair] of pairs.entries()) {
      const currentInput = path[i];
      (0, import_tiny_invariant8.default)(currentInput.equals(pair.token0) || currentInput.equals(pair.token1), "PATH");
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
var import_tiny_invariant9 = __toESM(require("tiny-invariant"));
function inputOutputComparator(a, b) {
  (0, import_tiny_invariant9.default)(a.inputAmount.currency.equals(b.inputAmount.currency), "INPUT_CURRENCY");
  (0, import_tiny_invariant9.default)(a.outputAmount.currency.equals(b.outputAmount.currency), "OUTPUT_CURRENCY");
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
      (0, import_tiny_invariant9.default)(amount.currency.equals(route.input), "INPUT");
      tokenAmounts[0] = amount.wrapped;
      for (let i = 0; i < route.path.length - 1; i++) {
        const pair = route.pairs[i];
        const [outputAmount] = pair.getOutputAmount(tokenAmounts[i]);
        tokenAmounts[i + 1] = outputAmount;
      }
      this.inputAmount = CurrencyAmount2.fromFractionalAmount(route.input, amount.numerator, amount.denominator);
      this.outputAmount = CurrencyAmount2.fromFractionalAmount(route.output, tokenAmounts[tokenAmounts.length - 1].numerator, tokenAmounts[tokenAmounts.length - 1].denominator);
    } else {
      (0, import_tiny_invariant9.default)(amount.currency.equals(route.output), "OUTPUT");
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
    (0, import_tiny_invariant9.default)(!slippageTolerance.lessThan(ZERO), "SLIPPAGE_TOLERANCE");
    if (this.tradeType === 1 /* EXACT_OUTPUT */) {
      return this.outputAmount;
    } else {
      const slippageAdjustedAmountOut = new Fraction(ONE).add(slippageTolerance).invert().multiply(this.outputAmount.quotient).quotient;
      return CurrencyAmount2.fromRawAmount(this.outputAmount.currency, slippageAdjustedAmountOut);
    }
  }
  maximumAmountIn(slippageTolerance) {
    (0, import_tiny_invariant9.default)(!slippageTolerance.lessThan(ZERO), "SLIPPAGE_TOLERANCE");
    if (this.tradeType === 0 /* EXACT_INPUT */) {
      return this.inputAmount;
    } else {
      const slippageAdjustedAmountIn = new Fraction(ONE).add(slippageTolerance).multiply(this.inputAmount.quotient).quotient;
      return CurrencyAmount2.fromRawAmount(this.inputAmount.currency, slippageAdjustedAmountIn);
    }
  }
  static bestTradeExactIn(pairs, currencyAmountIn, currencyOut, { maxNumResults = 3, maxHops = 3 } = {}, currentPairs = [], nextAmountIn = currencyAmountIn, bestTrades = []) {
    (0, import_tiny_invariant9.default)(pairs.length > 0, "PAIRS");
    (0, import_tiny_invariant9.default)(maxHops > 0, "MAX_HOPS");
    (0, import_tiny_invariant9.default)(currencyAmountIn === nextAmountIn || currentPairs.length > 0, "INVALID_RECURSION");
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
    (0, import_tiny_invariant9.default)(pairs.length > 0, "PAIRS");
    (0, import_tiny_invariant9.default)(maxHops > 0, "MAX_HOPS");
    (0, import_tiny_invariant9.default)(currencyAmountOut === nextAmountOut || currentPairs.length > 0, "INVALID_RECURSION");
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
var import_tiny_invariant10 = __toESM(require("tiny-invariant"));
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
    (0, import_tiny_invariant10.default)(!!wnative, "WRAPPED");
    return wnative;
  }
  static onChain(chainId) {
    if (chainId in this.cache) {
      return this.cache[chainId];
    }
    (0, import_tiny_invariant10.default)(!!NATIVE[chainId], "NATIVE_CURRENCY");
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
var import_tiny_invariant11 = __toESM(require("tiny-invariant"));
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
    (0, import_tiny_invariant11.default)(!(etherIn && etherOut), "ETHER_IN_OUT");
    (0, import_tiny_invariant11.default)(!("ttl" in options) || options.ttl > 0, "TTL");
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
        (0, import_tiny_invariant11.default)(!useFeeOnTransfer, "EXACT_OUT_FOT");
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseCurrency,
  ChainId,
  CurrencyAmount,
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
  JSBI,
  MINIMUM_LIQUIDITY,
  MaxUint256,
  NATIVE,
  Native,
  NativeCurrency,
  ONE,
  Pair,
  Percent,
  Price,
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
});
