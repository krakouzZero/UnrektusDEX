import { parseUnits } from '@ethersproject/units'
import { useSousChef } from 'hooks/useContract'
import { useCallback } from 'react'

const sousUnstake = (sousChefContract: any, amount: string, decimals: number) => {
  // const gasPrice = getGasPrice()
  const units = parseUnits(amount, decimals)

  return sousChefContract.withdraw(units.toString(), {})
}

const sousEmergencyUnstake = (sousChefContract: any) => {
  // const gasPrice = getGasPrice()
  return sousChefContract.emergencyWithdraw({})
}

const useUnstakePool = (sousId: number, enableEmergencyWithdraw = false) => {
  const sousChefContract = useSousChef(sousId)

  const handleUnstake = useCallback(
    async (amount: string, decimals: number) => {
      if (enableEmergencyWithdraw) {
        return sousEmergencyUnstake(sousChefContract)
      }

      return sousUnstake(sousChefContract, amount, decimals)
    },
    [enableEmergencyWithdraw, sousChefContract],
  )

  return { onUnstake: handleUnstake }
}

export default useUnstakePool
