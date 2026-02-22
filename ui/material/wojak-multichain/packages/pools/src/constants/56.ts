import { bscTokens } from '@pancakeswap/tokens'
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
    sousId: 341,
    stakingToken: bscTokens.cake,
    earningToken: bscTokens.pstake,
    contractAddress: '0x17086aF09D63852aD4646f1f837b34e171bEa99B',
    poolCategory: PoolCategory.CORE,
    tokenPerBlock: '0.5497',
    version: 3,
  },

  {
    sousId: 329,
    stakingToken: bscTokens.hay,
    earningToken: bscTokens.cake,
    contractAddress: '0x1c7D573D9614187096276a01Ec15263FCa820BDD',
    poolCategory: PoolCategory.CORE,
    tokenPerBlock: '0.0121',
    version: 3,
  },
].map((p) => ({
  ...p,
  isFinished: true,
  stakingToken: p.stakingToken.serialize,
  earningToken: p.earningToken.serialize,
}))

export const pools: SerializedPoolConfig[] = [...livePools, ...finishedPools]
