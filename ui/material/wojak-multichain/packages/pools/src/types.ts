import { SerializedWrappedToken } from '@pancakeswap/tokens'

export enum PoolCategory {
  'COMMUNITY' = 'Community',
  'CORE' = 'Core',
  'BINANCE' = 'Binance', // Pools using native BNB behave differently than pools using a token
  'AUTO' = 'Auto',
}

export interface PoolConfigBaseProps {
  sousId: number
  contractAddress: string
  poolCategory: PoolCategory
  tokenPerBlock: string
  isFinished?: boolean
  enableEmergencyWithdraw?: boolean
  version?: number
}

export interface SerializedPoolConfig extends PoolConfigBaseProps {
  earningToken: SerializedWrappedToken
  stakingToken: SerializedWrappedToken
}
