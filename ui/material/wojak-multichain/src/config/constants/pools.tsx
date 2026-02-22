import { BigNumber } from '@ethersproject/bignumber'
import { bscTokens, dogechainTokens } from '@pancakeswap/tokens'
import Trans from 'components/Trans'
import { VaultKey } from 'state/types'
import { PoolCategory, SerializedPoolConfig } from './types'

export const MAX_LOCK_DURATION = 31536000
export const UNLOCK_FREE_DURATION = 604800
export const ONE_WEEK_DEFAULT = 604800
export const BOOST_WEIGHT = BigNumber.from('20000000000000')
export const DURATION_FACTOR = BigNumber.from('31536000')

export const vaultPoolConfig = {
  [VaultKey.CakeVaultV1]: {
    name: <Trans>Auto CAKE</Trans>,
    description: <Trans>Automatic restaking</Trans>,
    autoCompoundFrequency: 5000,
    gasLimit: 380000,
    tokenImage: {
      primarySrc: `/images/2000/tokens/${dogechainTokens.wojk.address}.png`,
      secondarySrc: '/images/tokens/autorenew.svg',
    },
  },
  [VaultKey.CakeVault]: {
    name: <Trans>Stake WOJK</Trans>,
    description: <Trans>Stake, Earn – And more!</Trans>,
    autoCompoundFrequency: 5000,
    gasLimit: 800000,
    tokenImage: {
      primarySrc: `/images/2000/tokens/${dogechainTokens.wojk.address}.png`,
      secondarySrc: '/images/tokens/autorenew.svg',
    },
  },
  [VaultKey.CakeFlexibleSideVault]: {
    name: <Trans>Flexible WOJK</Trans>,
    description: <Trans>Flexible staking on the side.</Trans>,
    autoCompoundFrequency: 5000,
    gasLimit: 800000,
    tokenImage: {
      primarySrc: `/images/2000/tokens/${dogechainTokens.wojk.address}.png`,
      secondarySrc: '/images/tokens/autorenew.svg',
    },
  },
  [VaultKey.IfoPool]: {
    name: 'IFO CAKE',
    description: <Trans>Stake CAKE to participate in IFOs</Trans>,
    autoCompoundFrequency: 1,
    gasLimit: 800000,
    tokenImage: {
      primarySrc: `/images/tokens/${bscTokens.cake.address}.svg`,
      secondarySrc: `/images/tokens/ifo-pool-icon.svg`,
    },
  },
} as const

export const livePools: SerializedPoolConfig[] = [
  {
    sousId: 0,
    stakingToken: dogechainTokens.wojk,
    earningToken: dogechainTokens.wojk,
    contractAddress: {
      97: '0xB4A466911556e39210a6bB2FaECBB59E4eB7E43d',
      56: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
      2000: '0x065AAE6127D2369C85fE3086b6707Ac5dBe8210a',
    },
    poolCategory: PoolCategory.CORE,
    tokenPerBlock: '10',
    isFinished: false,
  },
].map((p) => ({
  ...p,
  stakingToken: p.stakingToken.serialize,
  earningToken: p.earningToken.serialize,
}))

const finishedPools = [
  {
    sousId: 1,
    stakingToken: dogechainTokens.wojk,
    earningToken: dogechainTokens.tdh,
    contractAddress: {
      56: '0x86471019Bf3f403083390AC47643062e15B0256e',
      97: '',
      2000: '0xa137fc1a0a8062500aef1abb1b825d7c271d97ab',
    },
    version: 1,
    isFinished: true,
    poolCategory: PoolCategory.CORE,
    tokenPerBlock: '5.79',
  },
  {
    sousId: 2,
    stakingToken: dogechainTokens.wojk,
    earningToken: dogechainTokens.tdh,
    contractAddress: {
      56: '0x86471019Bf3f403083390AC47643062e15B0256e',
      97: '',
      2000: '0x4a4ecbdcff1cbfc71dd7bd721105a4f2c06b4164',
    },
    enableEmergencyWithdraw: true,
    poolCategory: PoolCategory.CORE,
    tokenPerBlock: '0.4756',
    isFinshed: true,
  },
].map((p) => ({
  ...p,
  isFinished: true,
  stakingToken: p.stakingToken.serialize,
  earningToken: p.earningToken.serialize,
}))

export default [...livePools, ...finishedPools]
