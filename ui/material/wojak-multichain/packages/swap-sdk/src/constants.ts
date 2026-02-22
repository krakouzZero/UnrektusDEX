import JSBI from 'jsbi'
import { Token } from './entities/token'

export type BigintIsh = JSBI | number | string

export enum ChainId {
  BSC = 56,
  BSC_TESTNET = 97,
  DOGECHAIN = 2000,
}

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT,
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP,
}

export const FACTORY_ADDRESS_BSC = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
export const FACTORY_ADDRESS_BSC_TESTNET = '0x6725f303b657a9451d8ba641348b6761a6cc7a17'
export const FACTORY_ADDRESS_DC = '0xc7c86B4f940Ff1C13c736b697e3FbA5a6Bc979F9'

export const FACTORY_ADDRESS_MAP: Record<number, string> = {
  [ChainId.BSC]: FACTORY_ADDRESS_BSC,
  [ChainId.BSC_TESTNET]: FACTORY_ADDRESS_BSC_TESTNET,
  [ChainId.DOGECHAIN]: FACTORY_ADDRESS_DC,
}
export const INIT_CODE_HASH_BSC = '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5'
export const INIT_CODE_HASH_BSC_TESTNET = '0xd0d4c4cd0848c93cb4fd1f498d7013ee6bfb25783ea21593d5834f5d250ece66'
export const INIT_CODE_HASH_DC = '0x7856aa433cee3d1a7f4b34cd0f0cf0967c2345e951944c19991f4a73d0f5eee6'

export const INIT_CODE_HASH_MAP: Record<number, string> = {
  [ChainId.BSC]: INIT_CODE_HASH_BSC,
  [ChainId.BSC_TESTNET]: INIT_CODE_HASH_BSC_TESTNET,
  [ChainId.DOGECHAIN]: INIT_CODE_HASH_DC,
}

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const TWO = JSBI.BigInt(2)
export const THREE = JSBI.BigInt(3)
export const FIVE = JSBI.BigInt(5)
export const TEN = JSBI.BigInt(10)
export const _100 = JSBI.BigInt(100)
export const _9975 = JSBI.BigInt(9975)
export const _10000 = JSBI.BigInt(10000)

export const MaxUint256 = JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256',
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
}

export const WETH9 = {
  [ChainId.DOGECHAIN]: new Token(
    ChainId.DOGECHAIN,
    '0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101',
    18,
    'DOGE',
    'Wrapped DOGE',
    'https://dogechain.dog/'
  ),
}

export const WBNB = {
  [ChainId.BSC]: new Token(
    ChainId.BSC,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org'
  ),
  [ChainId.BSC_TESTNET]: new Token(
    ChainId.BSC_TESTNET,
    '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org'
  ),
}

export const WNATIVE: Record<number, Token> = {
  [ChainId.BSC]: WBNB[ChainId.BSC],
  [ChainId.BSC_TESTNET]: WBNB[ChainId.BSC_TESTNET],
  [ChainId.DOGECHAIN]: WETH9[ChainId.DOGECHAIN],
}

export const NATIVE: Record<
  number,
  {
    name: string
    symbol: string
    decimals: number
  }
> = {
  [ChainId.BSC]: {
    name: 'Binance Chain Native Token',
    symbol: 'BNB',
    decimals: 18,
  },
  [ChainId.BSC_TESTNET]: {
    name: 'Binance Chain Native Token',
    symbol: 'tBNB',
    decimals: 18,
  },
  [ChainId.DOGECHAIN]: {
    name: 'DogeChain Native Token',
    symbol: 'DOGE',
    decimals: 18,
  },
}
