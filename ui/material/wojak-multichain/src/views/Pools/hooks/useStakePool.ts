import BigNumber from 'bignumber.js'
import { BOOSTED_FARM_GAS_LIMIT, DEFAULT_TOKEN_DECIMAL } from 'config'
import { useSousChef } from 'hooks/useContract'
import { useCallback } from 'react'
import { getFullDecimalMultiplier } from 'utils/getFullDecimalMultiplier'

const options = {
  gasLimit: BOOSTED_FARM_GAS_LIMIT,
}

const sousStake = async (sousChefContract, amount, decimals = 18) => {
  // const gasPrice = getGasPrice()
  return sousChefContract.deposit(new BigNumber(amount).times(getFullDecimalMultiplier(decimals)).toString(), {
    ...options,
  })
}

const sousStakeBnb = async (sousChefContract, amount) => {
  // const gasPrice = getGasPrice()
  return sousChefContract.deposit(new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString(), {
    ...options,
  })
}

const useStakePool = (sousId: number, isUsingBnb = false) => {
  const sousChefContract = useSousChef(sousId)

  const handleStake = useCallback(
    async (amount: string, decimals: number) => {
      if (isUsingBnb) {
        return sousStakeBnb(sousChefContract, amount)
      }
      return sousStake(sousChefContract, amount, decimals)
    },
    [isUsingBnb, sousChefContract],
  )

  return { onStake: handleStake }
}

export default useStakePool
