'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { Header } from '@/components/dashboard/header'
import { useWallets } from '@privy-io/react-auth'

// ... (rest of the imports)

export default function JoinRoundPage() {
  const router = useRouter()
  const { wallets } = useWallets()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [activeRoundId, setActiveRoundId] = useState<number | null>(null)
  const [roundInfo, setRoundInfo] = useState<any | null>(null)
  const [entryFee, setEntryFee] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoundData() {
      const wallet = wallets[0];
      if (!wallet) return
      try {
        setIsFetching(true)
        const provider = await wallet.getEthereumProvider();
        const ethersProvider = new ethers.BrowserProvider(provider)
        const contract = new ethers.Contract(fortunaCoreAddress, fortunaCoreABI, ethersProvider)
        
        const activeId = await contract.getActiveRound()
        setActiveRoundId(Number(activeId))
        
        const info = await contract.getRoundInfo(activeId)
        setRoundInfo(info)
        
        const fee = await contract.getEntryFee()
        setEntryFee(ethers.formatUnits(fee, 6))
      } catch (error) {
        console.error('Error fetching round data:', error)
      } finally {
        setIsFetching(false)
      }
    }
    fetchRoundData()
  }, [wallets])

  const platformFee = entryFee ? (Number(entryFee) * 0.02).toFixed(2) : '0.00'
  const totalCost = entryFee ? (Number(entryFee) + Number(platformFee)).toFixed(2) : '0.00'

  const handleJoinRound = async () => {
    const wallet = wallets[0];
    if (!wallet || !activeRoundId || !entryFee) return
    setIsLoading(true)
    try {
      // Ethers setup for the final transaction
      const provider = await wallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(provider)
      const ethersSigner = await ethersProvider.getSigner()
      const contract = new ethers.Contract(fortunaCoreAddress, fortunaCoreABI, ethersSigner)
      
      // Viem setup for signing the permit
      const viemClient = await wallet.getViemClient()
      const viemAccount = await wallet.getViemAccount()

      const permitAmount = ethers.parseUnits(totalCost, 6)
      
      const signature = await signPermit({
        tokenAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS!,
        client: viemClient,
        account: viemAccount,
        spenderAddress: fortunaCoreAddress,
        permitAmount: permitAmount,
      })

      // Call the correct contract method with the signature
      const tx = await contract.joinRoundWithPermit(activeRoundId, permitAmount, signature, {
        gasLimit: 1000000,
      })
      
      await tx.wait()
      
      router.push(`/active-round/${activeRoundId}`)
    } catch (error) {
      console.error('Error joining round:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white mb-8 -ml-2"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="card-elevated p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Join Round #{activeRoundId}</h1>
            <p className="text-slate-400">Max 50 players. Round closes when full or in 1 hour.</p>
          </div>

          <Card className="bg-slate-800/50 border border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Players</span>
              <span className="font-semibold text-white">{roundInfo ? Number(roundInfo.playerCount) : 0} / 50</span>
            </div>
            <div className="border-t border-slate-700" />
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Prize Pool</span>
              <span className="font-semibold text-emerald-400">{roundInfo ? ethers.formatUnits(roundInfo.prizePool, 6) : 0} USDC</span>
            </div>
            <div className="border-t border-slate-700" />
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Your Potential Winnings</span>
              <span className="font-semibold text-white">{roundInfo ? (Number(ethers.formatUnits(roundInfo.prizePool, 6)) * 0.98).toFixed(2) : 0} USDC</span>
            </div>
          </Card>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Cost Breakdown</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <span className="text-slate-400">Entry Fee</span>
                <span className="text-white font-semibold">{entryFee} USDC</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                <span className="text-slate-400">Platform Fee (2%)</span>
                <span className="text-white font-semibold">{platformFee} USDC</span>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Total Cost</span>
                <span className="text-2xl font-bold text-emerald-400">{totalCost} USDC</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleJoinRound}
            disabled={isLoading || isFetching}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processing Gasless Transaction...
              </>
            ) : (
              'Confirm & Join with USDC'
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            Gasless transaction sponsored by our paymaster. No gas fees required. USDC transfer secured via EIP-2612 permit.
          </p>
        </Card>
      </main>
    </div>
  )
}
