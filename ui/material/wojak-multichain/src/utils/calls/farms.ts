import { Contract } from '@ethersproject/contracts'
import BigNumber from 'bignumber.js'
import { BOOSTED_FARM_GAS_LIMIT, DEFAULT_TOKEN_DECIMAL } from 'config'

const options = {
  gasLimit: BOOSTED_FARM_GAS_LIMIT,
}

export const stakeFarm = async (masterChefContract: Contract, pid, amount) => {
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()

  return masterChefContract.deposit(pid, value, { ...options })
}

export const unstakeFarm = async (masterChefContract, pid, amount) => {
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()

  return masterChefContract.withdraw(pid, value, { ...options })
}

export const harvestFarm = async (masterChefContract, pid) => {
  return masterChefContract.deposit(pid, '0', { ...options })
}
