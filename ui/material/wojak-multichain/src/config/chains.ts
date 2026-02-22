import { ChainId } from '@pancakeswap/sdk'
import invert from 'lodash/invert'
import memoize from 'lodash/memoize'

export const CHAIN_QUERY_NAME: Record<ChainId, string> = {
  [ChainId.BSC]: 'bsc',
  [ChainId.BSC_TESTNET]: 'bscTestnet',
  [ChainId.DOGECHAIN]: 'dogechain',
}

const CHAIN_QUERY_NAME_TO_ID = invert(CHAIN_QUERY_NAME)

export const getChainId = memoize((chainName: string) => {
  if (!chainName) return undefined
  return CHAIN_QUERY_NAME_TO_ID[chainName] ? +CHAIN_QUERY_NAME_TO_ID[chainName] : undefined
})
