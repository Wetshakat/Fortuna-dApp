'use client'

import { usePrivy } from '@privy-io/react-auth'
import AuthChoiceModal from './AuthChoiceModal'

export default function AuthModalWrapper() {
  const { authenticated } = usePrivy()

  if (authenticated) {
    return null // Don't show the modal if authenticated
  }

  return <AuthChoiceModal />
}
