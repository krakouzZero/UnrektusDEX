import { SerializedFarmConfig } from '@pancakeswap/farms'
import { dogechainTokens } from '@pancakeswap/tokens'

const farms: SerializedFarmConfig[] = [
  {
    pid: 2,
    lpSymbol: 'WOJK-DOGE LP',
    lpAddress: '0xf4da9059f5BB18b50773Fe1725b94Fc189E1b75c',
    boosted: true,
    token: dogechainTokens.wojk,
    quoteToken: dogechainTokens.wdoge,
  },
  {
    pid: 3,
    lpSymbol: 'USDC-DOGE LP',
    lpAddress: '0xcDBe962de3BdC40E790E48657721295C991d50e3',
    token: dogechainTokens.usdc,
    quoteToken: dogechainTokens.wdoge,
  },
  {
    pid: 4,
    lpSymbol: 'WOJK-USDC LP',
    lpAddress: '0xC1FaBe61B9cFC005a51e1Ea899C3D65fb6392497',
    boosted: true,
    token: dogechainTokens.usdc,
    quoteToken: dogechainTokens.wojk,
  },
  {
    pid: 5,
    lpSymbol: 'USDT-USDC LP',
    lpAddress: '0x4C7A746b038BF284316195733dA8839959a550A0',
    token: dogechainTokens.usdt,
    quoteToken: dogechainTokens.usdc,
  },
  {
    pid: 6,
    lpSymbol: 'BUSD-USDC LP',
    lpAddress: '0x311F8804AeECc98Da11c128C96182c4b3e6a34E2',
    token: dogechainTokens.busd,
    quoteToken: dogechainTokens.usdc,
  },
  {
    pid: 7,
    lpSymbol: 'ETH-USDC LP',
    lpAddress: '0xefcE65a87c385F8c3b5de0f7CdEae7633d72e14B',
    token: dogechainTokens.eth,
    quoteToken: dogechainTokens.usdc,
  },
  {
    pid: 8,
    lpSymbol: 'BNB-USDC LP',
    lpAddress: '0x1e7Bf76e85baE55338924aBa733d2deB68716b31',
    token: dogechainTokens.bnb,
    quoteToken: dogechainTokens.usdc,
  },
  {
    pid: 9,
    lpSymbol: 'DC-DOGE LP',
    lpAddress: '0xF63FB7511A26E442Cb890d13F7bB7d7012f4941a',
    token: dogechainTokens.dc,
    quoteToken: dogechainTokens.wdoge,
  },
  {
    pid: 10,
    lpSymbol: 'DAS-DOGE LP',
    lpAddress: '0xAc1FB7e65b338d4FdeD15D8Ce093184B232F2a7F',
    token: dogechainTokens.das,
    quoteToken: dogechainTokens.wdoge,
  },
  {
    pid: 11,
    lpSymbol: 'xDOGLANDS-WOJK LP',
    lpAddress: '0x39925af6e97a55955877da3e337b18b73fd39224',
    token: dogechainTokens.xdog,
    quoteToken: dogechainTokens.wojk,
  },
  {
    pid: 12,
    lpSymbol: '$SAVIOR-WOJK LP',
    lpAddress: '0x7b5348252ec3086c22bc211ea00a4bfd460501d1',
    token: dogechainTokens.egod,
    quoteToken: dogechainTokens.wojk,
  },
  {
    pid: 13,
    lpSymbol: 'PooDoge-WOJK LP',
    lpAddress: '0xd73560cf0b0798888a6295dc73ea474d57a8d5c4',
    token: dogechainTokens.poodoge,
    quoteToken: dogechainTokens.wojk,
  },
  {
    pid: 14,
    lpSymbol: 'DTools-WOJK LP',
    lpAddress: '0xe3badde2380eb481609a7f40e12931c74dd9ef12',
    token: dogechainTokens.dtools,
    quoteToken: dogechainTokens.wojk,
  },
  {
    pid: 15,
    lpSymbol: 'TDH-DOGE LP',
    lpAddress: '0x553AaCF6Ef76Abdcfcb353Ad8987B80a52bf9739',
    token: dogechainTokens.tdh,
    quoteToken: dogechainTokens.wdoge,
  },
].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default farms
