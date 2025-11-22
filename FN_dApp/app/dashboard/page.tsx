'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut, Copy } from 'lucide-react'
import { Header } from '@/components/dashboard/header'
import { ActiveRoundCard } from '@/components/dashboard/active-round-card'
import { BalanceCard } from '@/components/dashboard/balance-card'
import { usePrivy } from '@privy-io/react-auth'
import { useToast } from '@/components/ui/use-toast'
import { useRoundInfo } from '@/hooks/use-round-info'

// If you use the SIWE helper hook from Privy, import it when available:
// import { useLoginWithSiwe } from '@privy-io/react-auth' // optional

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview')
  // usePrivy typically returns the user + methods like openLoginModal / logout
  const privy = usePrivy?.() ?? null
  const { user, ready } = privy ?? { user: null, ready: false }
  const { toast } = useToast()
  const { roundInfo, loading: roundInfoLoading, error: roundInfoError } = useRoundInfo()

  useEffect(() => {
    console.debug('Privy user:', user)
  }, [user])

  useEffect(() => {
    if (ready && !user) {
      router.push('/login')
    }
  }, [ready, user, router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400">Loading…</div>
      </div>
    )
  }
  if (!user) return null

  // find a linked wallet account (best-effort)
  const walletAccount =
    user?.linkedAccounts?.find?.(
      (a: any) =>
        a?.type === 'wallet' ||
        a?.provider?.toLowerCase?.()?.includes('wallet') ||
        (typeof a?.address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(a.address))
    ) ?? null

  const walletAddress = walletAccount?.address ?? null
  const displayName =
    user?.linkedAccounts?.[0]?.name ??
    user?.email?.address?.split?.('@')?.[0] ??
    user?.name ??
    'User'

  // ---------- COPY ADDRESS ----------
  const handleCopyAddress = async () => {
    if (!walletAddress) {
      toast({
        title: 'No address',
        description: 'No wallet address available to copy.',
        variant: 'destructive',
      })
      return
    }
    try {
      await navigator.clipboard.writeText(walletAddress)
      toast({
        title: 'Address Copied!',
        description: 'Wallet address copied to clipboard.',
      })
    } catch (err) {
      console.error('Failed to copy address:', err)
      toast({
        title: 'Copy Failed',
        description: 'Could not copy address to clipboard.',
        variant: 'destructive',
      })
    }
  }

  // ---------- LOGOUT ----------
  const handleLogout = async () => {
    try {
      // Preferred: Privy exposes logout() according to docs.
      // Try common method names with optional chaining so different SDK versions still work.
      if (typeof privy?.logout === 'function') {
        await privy.logout()
      } else if (typeof privy?.signOut === 'function') {
        await privy.signOut()
      } else if (typeof privy?.close === 'function') {
        // some SDKs provide a close/clear session method
        await privy.close()
      } else {
        // Final fallback: try opening a server-side logout endpoint if you have one
        // e.g. await fetch('/api/auth/logout', { method: 'POST' })
        console.warn('No known logout function on privy object — falling back to redirect.')
      }
    } catch (err) {
      console.warn('Privy logout failed:', err)
    } finally {
      // Always redirect to home (or a signed-out landing page)
      router.push('/')
    }
  }

  // ---------- GOOGLE / OAuth SIGN-IN ----------
  const handleGoogle = async () => {
    try {
      // Common Privy SDK modal helper: openLoginModal / openAuthModal
      if (typeof privy?.openLoginModal === 'function') {
        // Some SDKs accept options; depending on your version you may pass provider info
        await privy.openLoginModal?.({ provider: 'google' })
      } else if (typeof privy?.openAuthModal === 'function') {
        await privy.openAuthModal?.({ provider: 'google' })
      } else if (typeof privy?.signInWithProvider === 'function') {
        await privy.signInWithProvider('google')
      } else {
        // Last fallback: open a backend route that starts the OAuth flow
        // Ensure you implement /api/auth/privy/google to initiate Privy OAuth if needed.
        window.open('/api/auth/privy/google', '_blank')
      }
    } catch (err) {
      console.error('Google sign-in failed:', err)
      toast({
        title: 'Sign-in failed',
        description: 'Unable to start Google sign-in.',
        variant: 'destructive',
      })
    }
  }

  // ---------- WALLET CONNECT / SIWE ----------
  const handleWalletConnect = async () => {
    try {
      // Preferred: Privy provides a wallet modal helper (openWalletModal or openLoginModal)
      if (typeof privy?.openWalletModal === 'function') {
        await privy.openWalletModal()
        return
      }
      // Some SDKs use the same login modal but pass a wallet option/provider
      if (typeof privy?.openLoginModal === 'function') {
        await privy.openLoginModal?.({ method: 'wallet' })
        return
      }
      // If your app uses the SIWE helper hook (useLoginWithSiwe), you'd call that here.
      // Example (if you import/use the hook):
      // const { loginWithSiwe } = useLoginWithSiwe()
      // await loginWithSiwe()
      if (typeof privy?.loginWithSiwe === 'function') {
        await privy.loginWithSiwe()
        return
      }
      // Last fallback: inform the user / open linking flow
      toast({
        title: 'Wallet Connect',
        description: 'Wallet connect is not available in this environment. Try linking a wallet in your account settings.',
      })
    } catch (err) {
      console.error('Wallet connect failed:', err)
      toast({
        title: 'Wallet Connect Failed',
        description: 'Could not connect wallet.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {displayName}</h1>

          {walletAddress ? (
            <div className="flex items-center gap-2">
              <p className="text-slate-400 truncate">{walletAddress}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyAddress}
                aria-label="Copy wallet address"
                className="text-slate-400 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <p className="text-red-400">No wallet connected. Please connect a wallet in your Privy settings.</p>
              <Button onClick={handleWalletConnect} className="h-10">Connect Wallet</Button>
              <Button onClick={handleGoogle} variant="ghost" className="h-10">Continue with Google</Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BalanceCard />
          <Card className="card-elevated p-6">
            <p className="text-slate-400 text-sm mb-2">Total Won</p>
            {/* TODO: Fetch actual total won data */}
            <p className="text-3xl font-bold text-white">2 USDC</p>
            <p className="text-emerald-400 text-sm mt-2">2 rounds won</p>
          </Card>
          <Card className="card-elevated p-6">
            <p className="text-slate-400 text-sm mb-2">Join Streak</p>
            {/* TODO: Fetch actual join streak data */}
            <p className="text-3xl font-bold text-white">2</p>
            <p className="text-slate-400 text-sm mt-2">consecutive rounds</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              Active Rounds
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <ActiveRoundCard />
            <Card className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Join a Round</h3>
              {roundInfoLoading ? (
                <p className="text-slate-400 mb-6">Loading round info...</p>
              ) : roundInfoError ? (
                <p className="text-red-400 mb-6">Error loading round info.</p>
              ) : (
                <p className="text-slate-400 mb-6">
                  Current round has {roundInfo?.currentPlayers}/{roundInfo?.maxPlayers} players. Join now to compete for the prize pool.
                </p>
              )}
              <Button
                onClick={() => router.push('/join-round')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold h-12"
              >
                Join Round
              </Button>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Game History</h3>
              <Button
                onClick={() => router.push('/history')}
                className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold h-12"
              >
                View Full History
              </Button>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-6">
            <Card className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Export Recovery Key</span>
                  <Button variant="outline" size="sm" className="border-emerald-500/50">
                    Export
                  </Button>
                </div>
                <div className="border-t border-slate-800" />
                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold h-10 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
