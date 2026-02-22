import { useTranslation } from '@pancakeswap/localization'
import { Flex, Heading } from '@pancakeswap/uikit'
import GradientLogo from '../GradientLogoSvg'

const Stats = () => {
  const { t } = useTranslation()
  // const { theme } = useTheme()

  // const { data: tvl } = useSWRImmutable('tvl')
  // const { data: txCount } = useSWRImmutable('totalTx30Days')
  // const { data: addressCount } = useSWRImmutable('addressCount30Days')
  // const tvlString = tvl ? formatLocalisedCompactNumber(tvl) : '-'

  // const tvlText = t('And those users are now entrusting the platform with over $%tvl% in funds.', { tvl: tvlString })

  return (
    <Flex justifyContent="center" alignItems="center" flexDirection="column">
      <GradientLogo height="420px" width="360px" mb="24px" />
      <Heading color="textSubtle" textAlign="center" scale="xl">
        {t('Unrektus')}
      </Heading>
      <Heading color="textSubtle" textAlign="center" scale="xl" mb="32px">
        {t('Unrekt your previous bad trades - new feature coming soon.')}
      </Heading>
      <Heading textAlign="center" color="textSubtle" scale="xl" mb="80px">
        {t('Muchwow')}
      </Heading>
    </Flex>
  )
}

export default Stats
