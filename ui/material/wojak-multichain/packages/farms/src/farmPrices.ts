import { BigNumber, FixedNumber } from '@ethersproject/bignumber'
import { ChainId } from '@pancakeswap/sdk'
import { FIXED_ONE, FIXED_TEN_IN_POWER_18, FIXED_TWO, FIXED_ZERO } from './const'
import { equalsIgnoreCase } from './equalsIgnoreCase'
import { FarmData, SerializedFarmPublicData } from './types'

export const getFarmBaseTokenPrice = (
  farm: SerializedFarmPublicData,
  quoteTokenFarm: SerializedFarmPublicData,
  nativePriceUSD: FixedNumber,
  wNative: string,
  stable: string,
  quoteTokenInBusd,
): FixedNumber => {
  const hasTokenPriceVsQuote = Boolean(farm.tokenPriceVsQuote)

  if (farm.quoteToken.symbol === stable) {
    return hasTokenPriceVsQuote ? FixedNumber.from(farm.tokenPriceVsQuote) : FIXED_ONE
  }

  if (farm.quoteToken.symbol === wNative) {
    return hasTokenPriceVsQuote ? nativePriceUSD.mulUnsafe(FixedNumber.from(farm.tokenPriceVsQuote)) : FIXED_ONE
  }

  if (!quoteTokenFarm) {
    return FIXED_ZERO
  }

  if (quoteTokenFarm.quoteToken.symbol === wNative || quoteTokenFarm.quoteToken.symbol === stable) {
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? FixedNumber.from(farm.tokenPriceVsQuote).mulUnsafe(quoteTokenInBusd)
      : FIXED_ONE
  }

  return FIXED_ZERO
}

export const getFarmQuoteTokenPrice = (
  farm: SerializedFarmPublicData,
  quoteTokenFarm: SerializedFarmPublicData,
  nativePriceUSD: FixedNumber,
  wNative: string,
  stable: string,
): FixedNumber => {
  if (farm.quoteToken.symbol === stable) {
    return FIXED_ONE
  }

  if (farm.quoteToken.symbol === wNative) {
    return nativePriceUSD
  }

  if (!quoteTokenFarm) {
    return FIXED_ZERO
  }

  if (quoteTokenFarm.quoteToken.symbol === wNative) {
    return quoteTokenFarm.tokenPriceVsQuote
      ? nativePriceUSD.mulUnsafe(FixedNumber.from(quoteTokenFarm.tokenPriceVsQuote))
      : FIXED_ZERO
  }

  if (quoteTokenFarm.quoteToken.symbol === stable) {
    return quoteTokenFarm.tokenPriceVsQuote ? FixedNumber.from(quoteTokenFarm.tokenPriceVsQuote) : FIXED_ZERO
  }

  return FIXED_ZERO
}

const getFarmFromTokenAddress = (
  farms: SerializedFarmPublicData[],
  tokenAddress: string,
  preferredQuoteTokens?: string[],
): SerializedFarmPublicData => {
  const farmsWithTokenSymbol = farms.filter((farm) => equalsIgnoreCase(farm.token.address, tokenAddress))
  const filteredFarm = filterFarmsByQuoteToken(farmsWithTokenSymbol, preferredQuoteTokens)
  return filteredFarm
}

const filterFarmsByQuoteToken = (
  farms: SerializedFarmPublicData[],
  preferredQuoteTokens: string[] = ['USDC', 'DOGE'],
): SerializedFarmPublicData => {
  const preferredFarm = farms.find((farm) => {
    return preferredQuoteTokens.some((quoteToken) => {
      return farm.quoteToken.symbol === quoteToken
    })
  })
  return preferredFarm || farms[0]
}

export const getLpTokenPrice = (
  lpTotalSupply: FixedNumber,
  lpTotalInQuoteToken: FixedNumber,
  tokenAmountTotal: FixedNumber,
  tokenPriceBusd: FixedNumber,
) => {
  let lpTokenPrice = FIXED_ZERO
  const lpTotalSupplyAsBigNumber = BigNumber.from(lpTotalSupply)
  const lpTotalInQuoteTokenBigNumber = BigNumber.from(lpTotalInQuoteToken)
  if (lpTotalSupplyAsBigNumber.gt(0) && lpTotalInQuoteTokenBigNumber.gt(0)) {
    const valueOfBaseTokenInFarm = tokenPriceBusd.mulUnsafe(tokenAmountTotal)
    const overallValueOfAllTokensInFarm = valueOfBaseTokenInFarm.mulUnsafe(FIXED_TWO)
    const totalLpTokens = lpTotalSupply.divUnsafe(FIXED_TEN_IN_POWER_18)
    lpTokenPrice = overallValueOfAllTokensInFarm.divUnsafe(totalLpTokens)
  }

  return lpTokenPrice
}

export type FarmWithPrices = FarmData & {
  tokenPriceBusd: string
  quoteTokenPriceBusd: string
  lpTokenPrice: string
}

export const getFarmsPrices = (farms: FarmData[], chainId: number): FarmWithPrices[] => {
  if (!nativeStableLpMap[chainId]) {
    throw new Error(`chainId ${chainId} not supported`)
  }
  const nativeStableFarm = farms.find((farm) => equalsIgnoreCase(farm.lpAddress, nativeStableLpMap[chainId].address))
  const nativePriceUSD = nativeStableFarm?.tokenPriceVsQuote
    ? FIXED_ONE.divUnsafe(FixedNumber.from(nativeStableFarm.tokenPriceVsQuote))
    : FIXED_ZERO

  const farmsWithPrices = farms.map((farm) => {
    const quoteTokenFarm = getFarmFromTokenAddress(farms, farm.quoteToken.address, [
      nativeStableLpMap[chainId].wNative,
      nativeStableLpMap[chainId].stable,
    ])

    const quoteTokenPriceBusd = getFarmQuoteTokenPrice(
      farm,
      quoteTokenFarm,
      nativePriceUSD,
      nativeStableLpMap[chainId].wNative,
      nativeStableLpMap[chainId].stable,
    )

    const tokenPriceBusd = getFarmBaseTokenPrice(
      farm,
      quoteTokenFarm,
      nativePriceUSD,
      nativeStableLpMap[chainId].wNative,
      nativeStableLpMap[chainId].stable,
      quoteTokenPriceBusd,
    )
    const lpTokenPrice = getLpTokenPrice(
      FixedNumber.from(farm.lpTotalSupply),
      FixedNumber.from(farm.lpTotalInQuoteToken),
      FixedNumber.from(farm.tokenAmountTotal),
      tokenPriceBusd,
    )
    return {
      ...farm,
      tokenPriceBusd: tokenPriceBusd.toString(),
      quoteTokenPriceBusd: quoteTokenPriceBusd.toString(),
      lpTokenPrice: lpTokenPrice.toString(),
    }
  })
  return farmsWithPrices
}

const nativeStableLpMap = {
  [ChainId.BSC]: {
    address: '0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16',
    wNative: 'WBNB',
    stable: 'BUSD',
  },
  [ChainId.BSC_TESTNET]: {
    address: '0x4E96D2e92680Ca65D58A0e2eB5bd1c0f44cAB897',
    wNative: 'WBNB',
    stable: 'BUSD',
  },
  [ChainId.DOGECHAIN]: {
    address: '0xcDBe962de3BdC40E790E48657721295C991d50e3',
    wNative: 'DOGE',
    stable: 'USDC',
  },
}
