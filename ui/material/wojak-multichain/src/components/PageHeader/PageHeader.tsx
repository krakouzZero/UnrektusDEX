import styled from 'styled-components'
import { Box } from '@pancakeswap/uikit'
import Container from '../Layout/Container'
import { PageHeaderProps } from './types'

const Outer = styled(Box)<{ background?: string }>`
  background-image: ${({ theme, background }) => `url("${background}")` || theme.colors.gradientBubblegum};
  background-size: cover;
`

const Inner = styled(Container)`
  padding-top: 32px;
  padding-bottom: 32px;
  position: relative;
`

const PageHeader: React.FC<React.PropsWithChildren<PageHeaderProps>> = ({ background, children, ...props }) => (
  <Outer background={background} {...props}>
    <Inner>{children}</Inner>
  </Outer>
)

export default PageHeader
