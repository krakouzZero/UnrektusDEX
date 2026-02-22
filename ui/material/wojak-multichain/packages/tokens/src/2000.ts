import { ChainId, Token, WETH9 } from '@pancakeswap/sdk'
import { USDC_DC, USDT_DC } from './common'

export const dogechainTokens = {
  wdoge: WETH9[ChainId.DOGECHAIN],
  usdc: USDC_DC,
  usdt: USDT_DC,
  cake: new Token(
    ChainId.DOGECHAIN,
    '0x570C41a71b5e2cb8FF4445184d7ff6f78A4DbcBD',
    18,
    'WOJK',
    'WojakToken',
    'https://www.wojak.fi/',
  ),
  wojk: new Token(
    ChainId.DOGECHAIN,
    '0x570C41a71b5e2cb8FF4445184d7ff6f78A4DbcBD',
    18,
    'WOJK',
    'WojakToken',
    'https://www.wojak.fi/',
  ),
  syrup: new Token(
    ChainId.DOGECHAIN,
    '0x009cF7bC57584b7998236eff51b98A168DceA9B0',
    18,
    'SYRUP',
    'SyrupBar Token',
    'https://pancakeswap.finance/',
  ),
  busd: new Token(ChainId.DOGECHAIN, '0x332730a4F6E03D9C55829435f10360E13cfA41Ff', 18, 'BUSD', 'BUSD Token', ''),
  eth: new Token(ChainId.DOGECHAIN, '0xB44a9B6905aF7c801311e8F4E76932ee959c663C', 18, 'ETH', 'Ethereum Token', ''),
  bnb: new Token(ChainId.DOGECHAIN, '0xA649325Aa7C5093d12D6F98EB4378deAe68CE23F', 18, 'BNB', 'Wrapped BNB', ''),
  dc: new Token(ChainId.DOGECHAIN, '0x7B4328c127B85369D9f82ca0503B000D09CF9180', 18, 'DC', 'Dogechain Token', ''),
  das: new Token(ChainId.DOGECHAIN, '0xF4413B0576048c39E8190C8680A1d6c4108e6C1E', 18, 'DAS', 'DarkSwap Token', ''),
  xdog: new Token(ChainId.DOGECHAIN, '0x21ccE73fED737EBc35EC7fF8504a300e41f7f0f1', 18, 'xDOGLANDS', 'xDOGLANDS Presale Token', ''),
  rekt: new Token(ChainId.DOGECHAIN, '0x7fC009aDC0B7A5E9C81F2e0E7a14c6c281ABb99C', 18, 'REKT', 'Unrektus', ''),
  egod: new Token(ChainId.DOGECHAIN, '0xBfbb7B1d22FF521a541170cAFE0C9A7F20d09c3B', 0, '$SAVIOR', 'Egod The Savior', ''),
  poodoge: new Token(ChainId.DOGECHAIN, '0x3f4aE49EABEa4cc250a640eEa788a321C0AE7EB2', 18, 'Poo Doge', 'Poo Doge', ''),
  dtools: new Token(ChainId.DOGECHAIN, '0x1df5c9b7789bd1416d005c15a42762481c95edc2', 18, 'DTools', 'DogeTools', ''),
  tdh: new Token(ChainId.DOGECHAIN, '0x1c2bB5d2812D307C2056C6A406d334676D067EE9', 18, 'TDH', 'TDH', ''),
}