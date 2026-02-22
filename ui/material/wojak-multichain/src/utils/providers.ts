import { StaticJsonRpcProvider } from '@ethersproject/providers'

export const BSC_PROD_NODE = process.env.NEXT_PUBLIC_NODE_PRODUCTION || 'https://bsc.nodereal.io'
export const DC_PROD_NODE = process.env.NEXT_PUBLIC_NODE_PRODUCTION || 'https://rpc.ankr.com/dogechain'

export const bscRpcProvider = new StaticJsonRpcProvider(BSC_PROD_NODE)

export const dcRpcProvider = new StaticJsonRpcProvider(DC_PROD_NODE)

export default null
