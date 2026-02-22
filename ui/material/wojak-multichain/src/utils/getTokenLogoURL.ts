import { ChainId, Token } from '@pancakeswap/sdk'

const mapping = {
  [ChainId.BSC]: 'smartchain',
  [ChainId.BSC_TESTNET]: 'smartchain',
  [ChainId.DOGECHAIN]: 'dogechain',
}

const getTokenLogoURL = (token?: Token) => {
  if (token && mapping[token.chainId] && token.chainId === ChainId.DOGECHAIN) {
    return `/images/${ChainId.DOGECHAIN}/tokens/${token.address}.png`
  }
  if (token && mapping[token.chainId]) {
    return `/images/tokens/${token.address}.png`
  }
  return null
}

export default getTokenLogoURL
