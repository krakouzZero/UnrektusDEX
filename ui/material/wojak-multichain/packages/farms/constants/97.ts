import { SerializedFarmConfig } from '@pancakeswap/farms'
import { bscTestnetTokens } from '@pancakeswap/tokens'

const farms: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'WOJK',
    lpAddress: '0x36e3E4fF6471559b19F66bD10985534d5e214D44',
    token: bscTestnetTokens.syrup,
    quoteToken: bscTestnetTokens.wbnb,
  },
  {
    pid: 3,
    lpSymbol: 'BUSD-WOJK LP',
    lpAddress: '0xb98C30fA9f5e9cf6749B7021b4DDc0DBFe73b73e',
    token: bscTestnetTokens.busd,
    quoteToken: bscTestnetTokens.wojk,
  },
  {
    pid: 4,
    lpSymbol: 'WOJK-BNB LP',
    lpAddress: '0xa96818CA65B57bEc2155Ba5c81a70151f63300CD',
    token: bscTestnetTokens.wojk,
    quoteToken: bscTestnetTokens.wbnb,
  },
  {
    pid: 10,
    lpSymbol: 'BNB-BUSD LP',
    lpAddress: '0x4E96D2e92680Ca65D58A0e2eB5bd1c0f44cAB897',
    token: bscTestnetTokens.wbnb,
    quoteToken: bscTestnetTokens.busd,
  },
  {
    pid: 9,
    lpSymbol: 'HBTC-WBTC LP',
    lpAddress: '0xc50eF16D5CCe3648057c5bF604025dCD633bd795',
    token: bscTestnetTokens.hbtc,
    quoteToken: bscTestnetTokens.wbtc,
    stableSwapContract: '0x270c8828e56C266CA1B100968B768Bd191C15747',
  },
].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default farms
