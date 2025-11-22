'use client'

import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export function WalletCreator({ children }: { children: React.ReactNode }) {
  const { user, authenticated, createWallet } = usePrivy()

  useEffect(() => {
    if (authenticated && !user?.wallet) {
      console.log('User is authenticated but has no wallet, creating one...')
      createWallet()
    }
  }, [authenticated, user, createWallet])

  return <>{children}</>
}
