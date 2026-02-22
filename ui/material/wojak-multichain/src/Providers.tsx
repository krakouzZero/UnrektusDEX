import { LanguageProvider } from '@pancakeswap/localization'
import { ModalProvider, UIKitProvider, dark } from '@pancakeswap/uikit'
import { WagmiProvider } from '@pancakeswap/wagmi'
import { Store } from '@reduxjs/toolkit'
import { HistoryManagerProvider } from 'contexts/HistoryContext'
import { fetchStatusMiddleware } from 'hooks/useSWRContract'
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes'
import { Provider } from 'react-redux'
import { SWRConfig } from 'swr'
import { client } from 'utils/wagmi'

const StyledUIKitProvider: React.FC<React.PropsWithChildren> = ({ children, ...props }) => {
  const { resolvedTheme } = useNextTheme()
  return (
    <UIKitProvider theme={resolvedTheme === 'dark' ? dark : dark} {...props}>
      {children}
    </UIKitProvider>
  )
}

const Providers: React.FC<React.PropsWithChildren<{ store: Store; children: React.ReactNode }>> = ({
  children,
  store,
}) => {
  return (
    <WagmiProvider client={client}>
      <Provider store={store}>
        <NextThemeProvider>
          <StyledUIKitProvider>
            <LanguageProvider>
              <SWRConfig
                value={{
                  use: [fetchStatusMiddleware],
                }}
              >
                <HistoryManagerProvider>
                  <ModalProvider>{children}</ModalProvider>
                </HistoryManagerProvider>
              </SWRConfig>
            </LanguageProvider>
          </StyledUIKitProvider>
        </NextThemeProvider>
      </Provider>
    </WagmiProvider>
  )
}

export default Providers
