import { ChainId } from '@pancakeswap/sdk'

import { livePools as wojkLivePools, pools as wojkPools } from './constants/2000'
import { livePools as bscLivePools, pools as bscPools } from './constants/56'
import { SerializedPoolConfig } from './types'

export type PoolsConfigByChain<TChainId extends ChainId> = {
  [chainId in TChainId]: SerializedPoolConfig[]
}

export const POOLS_CONFIG_BY_CHAIN = {
  [ChainId.BSC]: bscPools,
  [ChainId.DOGECHAIN]: wojkPools,
}

export const LIVE_POOLS_CONFIG_BY_CHAIN = {
  [ChainId.BSC]: bscLivePools,
  [ChainId.DOGECHAIN]: wojkLivePools,
}

export const getPoolsConfig = (chainId: ChainId) => {
  return POOLS_CONFIG_BY_CHAIN[chainId]
}

export const getLivePoolsConfig = (chainId: ChainId) => {
  return LIVE_POOLS_CONFIG_BY_CHAIN[chainId]
}
