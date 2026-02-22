// Constructing the two forward-slash-separated parts of the 'Add Liquidity' URL
// Each part of the url represents a different side of the LP pair.
import { dogechainTokens } from '@pancakeswap/tokens'
import { CHAIN_QUERY_NAME } from 'config/chains'

const getLiquidityUrlPathParts = ({
  quoteTokenAddress,
  tokenAddress,
  chainId,
}: {
  quoteTokenAddress: string
  tokenAddress: string
  chainId: number
}): string => {
  const wBnbAddress = dogechainTokens.wdoge.address
  const firstPart = !quoteTokenAddress || quoteTokenAddress === wBnbAddress ? 'DOGE' : quoteTokenAddress
  const secondPart = !tokenAddress || tokenAddress === wBnbAddress ? 'DOGE' : tokenAddress
  return `${firstPart}/${secondPart}?chain=${CHAIN_QUERY_NAME[chainId]}`
}

export default getLiquidityUrlPathParts
