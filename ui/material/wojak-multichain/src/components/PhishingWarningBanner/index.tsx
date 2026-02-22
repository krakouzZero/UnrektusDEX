import { useMemo } from 'react'
import styled from 'styled-components'
import { Text, Flex, Box, CloseIcon, IconButton, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { usePhishingBannerManager } from 'state/user/hooks'

const Container = styled(Flex)`
  overflow: hidden;
  height: 100%;
  padding: 12px;
  align-items: center;
  background: linear-gradient(0deg, rgba(128, 81, 214, 0.4), rgba(149, 74, 145, 0.4)),
    linear-gradient(180deg, #f6c65c 0%, #954a91 100%);
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 0px;
    background: linear-gradient(180deg, #f6c65c 0%, #954a91 100%);
  }
`

const InnerContainer = styled(Flex)`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`

const SpeechBubble = styled.div`
  background: rgba(39, 38, 44, 0.4);
  border-radius: 16px;
  padding: 8px;
  width: 60%;
  height: 80%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  & ${Text} {
    flex-shrink: 0;
    margin-right: 4px;
  }
`

const PhishingWarningBanner: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const [, hideBanner] = usePhishingBannerManager()
  const { isMobile, isMd } = useMatchBreakpoints()
  const warningTextAsParts = useMemo(() => {
    const warningText = t("please make sure you're visiting https://wojak.fi - check the URL carefully.")
    return warningText.split(/(https:\/\/wojak.fi)/g)
  }, [t])
  const warningTextComponent = (
    <>
      <Text as="span" color="warning" small bold textTransform="uppercase">
        {t('Phishing warning: ')}
      </Text>
      {warningTextAsParts.map((text, i) => (
        <Text
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          small
          as="span"
          bold={text === 'https://wojak.fi'}
          color={text === 'https://wojak.fi' ? '#FFFFFF' : '#BDC2C4'}
        >
          {text}
        </Text>
      ))}
    </>
  )
  return (
    <Container className="warning-banner">
      {isMobile || isMd ? (
        <>
          <Box>{warningTextComponent}</Box>
          <IconButton onClick={hideBanner} variant="text">
            <CloseIcon color="#FFFFFF" />
          </IconButton>
        </>
      ) : (
        <>
          <InnerContainer>
            <img
              src="/images/decorations/phishing-warning-bunny.webp"
              alt="phishing-warning"
              width="92px"
              onError={(e) => {
                const fallbackSrc = '/images/decorations/phishing-warning-bunny.png'
                if (!e.currentTarget.src.endsWith(fallbackSrc)) {
                  // eslint-disable-next-line no-param-reassign
                  e.currentTarget.src = fallbackSrc
                }
              }}
            />
            <SpeechBubble>{warningTextComponent}</SpeechBubble>
          </InnerContainer>
          <IconButton onClick={hideBanner} variant="text">
            <CloseIcon color="#FFFFFF" />
          </IconButton>
        </>
      )}
    </Container>
  )
}

export default PhishingWarningBanner
