import { MultiCallV2 } from '@pancakeswap/multicall'
import { ChainId } from '@pancakeswap/sdk'
import chunk from 'lodash/chunk'
import { nonBSCVaultAddresses } from './const'
import { SerializedFarmConfig, SerializedFarmPublicData } from './types'

const abi = [
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

const fetchFarmCalls = (farm: SerializedFarmPublicData, masterChefAddress: string, vaultAddress?: string) => {
  const { lpAddress, token, quoteToken } = farm
  return [
    {
      address: token.address,
      name: 'balanceOf',
      params: [lpAddress],
    },
    {
      address: quoteToken.address,
      name: 'balanceOf',
      params: [lpAddress],
    },
    {
      address: lpAddress,
      name: 'balanceOf',
      params: [vaultAddress || masterChefAddress],
    },
    {
      address: lpAddress,
      name: 'totalSupply',
    },
  ]
}

export const fetchPublicFarmsData = async (
  farms: SerializedFarmConfig[],
  chainId: ChainId,
  multicall: MultiCallV2,
  masterChefAddress: string,
): Promise<any[]> => {
  try {
    const farmCalls = farms.flatMap((farm) => fetchFarmCalls(farm, masterChefAddress, nonBSCVaultAddresses[chainId]))
    const chunkSize = farmCalls.length / farms.length
    const farmMultiCallResult = await multicall({ abi, calls: farmCalls, chainId })
    return chunk(farmMultiCallResult, chunkSize)
  } catch (error) {
    console.error('MasterChef Public Data error ', error)
    throw error
  }
}
