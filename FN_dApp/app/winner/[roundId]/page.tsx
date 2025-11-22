'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trophy, Loader2 } from 'lucide-react'
import { Header } from '@/components/dashboard/header'

export default function WinnerPage({ params }: { params: { roundId: string } }) {
  const router = useRouter()
  const [isClaimingReward, setIsClaimingReward] = useState(false)
  const [hasClaimedReward, setHasClaimedReward] = useState(false)

  const winnerAddress = '0xabc123def456789012345678901234567890abcd'
  const prizeAmount = 2
  const roundTime = new Date().toLocaleString()
  const isWinner = true

  const handleClaimReward = async () => {
    setIsClaimingReward(true)
    setTimeout(() => {
      setHasClaimedReward(true)
      setIsClaimingReward(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />

      <main className="mx-auto max-w-2xl px-6 py-8">
        {/* Celebration Animation Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Winner Card */}
        <Card className="card-elevated p-8 space-y-8 relative">
          {/* Trophy Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full">
              <Trophy className="w-10 h-10 text-emerald-400 animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
              You Won!
            </h1>
            <p className="text-slate-400">Congratulations! You're the round winner.</p>
          </div>

          {/* Prize Details */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/40 p-6">
              <p className="text-slate-400 text-sm mb-2">Prize Amount</p>
              <p className="text-4xl font-bold text-emerald-400 mb-2">{prizeAmount.toLocaleString()} USDC</p>
              <p className="text-slate-500 text-xs">Round #{params.roundId}</p>
            </Card>

            <Card className="bg-slate-800/50 border border-slate-700 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Winner Address</span>
                <span className="font-mono text-sm text-white truncate">{winnerAddress}</span>
              </div>
              <div className="border-t border-slate-700" />
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Round Completed</span>
                <span className="text-white">{roundTime}</span>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!hasClaimedReward ? (
              <Button
                onClick={handleClaimReward}
                disabled={isClaimingReward}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-lg"
              >
                {isClaimingReward ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Claiming Reward...
                  </>
                ) : (
                  'Claim Reward'
                )}
              </Button>
            ) : (
              <Button
                disabled
                className="w-full h-12 bg-emerald-500/20 text-emerald-400 font-semibold"
              >
                ✓ Reward Claimed
              </Button>
            )}

            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="w-full h-12 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
            >
              Back to Dashboard
            </Button>

            <Button
              onClick={() => router.push('/join-round')}
              className="w-full h-12 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold"
            >
              Play Again
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-slate-500 text-center">
            Your reward will be transferred to your smart account automatically.
          </p>
        </Card>
      </main>
    </div>
  )
}
