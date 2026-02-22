import { HelpIcon } from '@pancakeswap/uikit'
import Image from 'next/future/image'
import { memo } from 'react'
import { isChainSupported } from 'utils/wagmi'

export const ChainLogo = memo(({ chainId }: { chainId: number }) => {
  if (isChainSupported(chainId)) {
    return <Image alt="" src={`/images/chains/${chainId}.png`} width={24} height={24} unoptimized />
  }

  return <HelpIcon width={24} height={24} />
})
