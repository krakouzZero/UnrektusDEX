import { ChainId, Token } from '@pancakeswap/sdk'

export const WOJK_BSC = new Token(
  ChainId.DOGECHAIN,
  '0x570C41a71b5e2cb8FF4445184d7ff6f78A4DbcBD',
  18,
  'WOJK',
  'Wojak Token',
  'https://wojak.fi/',
)

export const WOJK_BSC_TESTNET = new Token(
  ChainId.DOGECHAIN,
  '0x570C41a71b5e2cb8FF4445184d7ff6f78A4DbcBD',
  18,
  'WOJK',
  'Wojak Token',
  'https://wojak.fi/',
)

export const WOJK_DOGECHAIN = new Token(
  ChainId.DOGECHAIN,
  '0x570C41a71b5e2cb8FF4445184d7ff6f78A4DbcBD',
  18,
  'WOJK',
  'Wojak Token',
  'https://wojak.fi/',
)

export const USDC_BSC = new Token(
  ChainId.BSC,
  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  18,
  'USDC',
  'Binance-Peg USD Coin',
  'https://www.centre.io/usdc',
)

export const USDC_TESTNET = new Token(
  ChainId.BSC_TESTNET,
  '0x64544969ed7EBf5f083679233325356EbE738930',
  18,
  'USDC',
  'Binance-Peg USD Coin',
  'https://www.centre.io/usdc',
)

export const USDC_DC = new Token(ChainId.DOGECHAIN, '0x765277EebeCA2e31912C9946eAe1021199B39C61', 6, 'USDC', 'USD Coin')

export const USDT_DC = new Token(
  ChainId.DOGECHAIN,
  '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
  6,
  'USDT',
  'Tether USD',
)

export const USDT_BSC = new Token(
  ChainId.BSC,
  '0x55d398326f99059fF775485246999027B3197955',
  18,
  'USDT',
  'Tether USD',
  'https://tether.to/',
)

export const BUSD_BSC = new Token(
  ChainId.BSC,
  '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
  18,
  'BUSD',
  'Binance USD',
  'https://www.paxos.com/busd/',
)

export const BUSD_TESTNET = new Token(
  ChainId.BSC_TESTNET,
  '0x8516Fc284AEEaa0374E66037BD2309349FF728eA',
  18,
  'BUSD',
  'Binance USD',
  'https://www.paxos.com/busd/',
)

export const BUSD_DC = new Token(
  ChainId.DOGECHAIN,
  '0x332730a4F6E03D9C55829435f10360E13cfA41Ff',
  18,
  'BUSD',
  'BUSD Token',
  'https://www.paxos.com/busd/',
)

export const BUSD: Record<ChainId, Token> = {
  [ChainId.BSC]: BUSD_BSC,
  [ChainId.BSC_TESTNET]: BUSD_TESTNET,
  [ChainId.DOGECHAIN]: BUSD_DC,
}

export const WOJK = {
  [ChainId.BSC]: WOJK_BSC,
  [ChainId.BSC_TESTNET]: WOJK_BSC_TESTNET,
  [ChainId.DOGECHAIN]: WOJK_DOGECHAIN,
}

export const USDC = {
  [ChainId.BSC]: USDC_BSC,
  [ChainId.BSC_TESTNET]: USDC_TESTNET,
  [ChainId.DOGECHAIN]: USDC_DC,
}

export const USDT = {
  [ChainId.BSC]: USDT_BSC,
  [ChainId.BSC_TESTNET]: USDC_TESTNET,
  [ChainId.DOGECHAIN]: USDT_DC,
}
