import { bscTokens, dogechainTokens } from '@pancakeswap/tokens'
import { PoolCategory, SerializedPoolConfig } from '../types'

export const livePools: SerializedPoolConfig[] = [
  {
    sousId: 0,
    stakingToken: bscTokens.cake,
    earningToken: bscTokens.cake,
    contractAddress: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
    poolCategory: PoolCategory.CORE,
    tokenPerBlock: '10',
    isFinished: false,
  },
  {
    sousId: 347,
    stakingToken: bscTokens.cake,
    earningToken: bscTokens.tusd,
    contractAddress: '0x72cd910eE115E494485Dd32Ce7bC5dE563eceA51',
    poolCategory: PoolCategory.CORE,
    tokenPerBlock: '0.02314',
    version: 3,
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
    contractAddress: '0xa137fc1a0a8062500aef1abb1b825d7c271d97ab',
    version: 1,
    isFinished: true,
    poolCategory: PoolCategory.CORE,
    tokenPerBlock: '5.79',
  },
  {
    sousId: 2,
    stakingToken: dogechainTokens.wojk,
    earningToken: dogechainTokens.tdh,
    contractAddress: '0x4a4ecbdcff1cbfc71dd7bd721105a4f2c06b4164',
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

export const pools: SerializedPoolConfig[] = [...livePools, ...finishedPools]
