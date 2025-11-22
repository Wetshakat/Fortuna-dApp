// app/privy-provider.tsx
'use client'

import React from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { WalletCreator } from './wallet-creator'
import { baseSepolia } from 'viem/chains'

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ''}
      config={{
        loginMethods: ['wallet', 'google'],
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: '/Fortuna.png',
        },
        embeddedWallets: {
          enabled: true,
        },
      }}
    >
      <WalletCreator>{children}</WalletCreator>
    </PrivyProvider>
  )
}
