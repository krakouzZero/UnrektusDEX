import { ChainId } from '@pancakeswap/sdk'
import FarmsDogeChainPriceHelper from './2000'
import FarmsBscPriceHelper from './56'
import FarmsBscTestnetPriceHelper from './97'

export const getFarmsPriceHelperLpFiles = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.BSC:
      return FarmsBscPriceHelper
    case ChainId.BSC_TESTNET:
      return FarmsBscTestnetPriceHelper
    case ChainId.DOGECHAIN:
      return FarmsDogeChainPriceHelper
    default:
      return []
  }
}
