'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, Trophy, X } from 'lucide-react'
import { Header } from '@/components/dashboard/header'

export default function HistoryPage() {
  const router = useRouter()
  const [filterTab, setFilterTab] = useState('all')

  const rounds = [
    {
      id: 1,
      status: 'won',
      amountEntered: 2,
      amountWon: 2,
      timestamp: '2 hours ago',
      players: 1,
    },
    {
      id: 2,
      status: 'won',
      amountEntered: 2,
      amountWon: 2,
      timestamp: '1 day ago',
      players: 1,
    },
    // {
    //   id: 3,
    //   status: 'won',
    //   amountEntered: 100,
    //   amountWon: 2300,
    //   timestamp: '3 days ago',
    //   players: 45,
    // },
    // {
    //   id: 4,
    //   status: 'lost',
    //   amountEntered: 100,
    //   amountWon: 0,
    //   timestamp: '5 days ago',
    //   players: 50,
    // },
    // {
    //   id: 5,
    //   status: 'won',
    //   amountEntered: 100,
    //   amountWon: 900,
    //   timestamp: '1 week ago',
    //   players: 20,
    // },
  ]

  const filteredRounds =
    filterTab === 'wins'
      ? rounds.filter((r) => r.status === 'won')
      : filterTab === 'losses'
        ? rounds.filter((r) => r.status === 'lost')
        : rounds

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="text-slate-400 hover:text-white mb-8 -ml-2"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Game History</h1>
          <p className="text-slate-400">View all your past rounds and results</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="card-elevated p-4">
            <p className="text-slate-400 text-sm mb-1">Total Rounds</p>
            <p className="text-2xl font-bold text-white">{rounds.length}</p>
          </Card>
          <Card className="card-elevated p-4">
            <p className="text-slate-400 text-sm mb-1">Wins</p>
            <p className="text-2xl font-bold text-emerald-400">{rounds.filter((r) => r.status === 'won').length}</p>
          </Card>
          <Card className="card-elevated p-4">
            <p className="text-slate-400 text-sm mb-1">Total Winnings</p>
            <p className="text-2xl font-bold text-white">
              {rounds.reduce((acc, r) => acc + r.amountWon, 0).toLocaleString()} USDC
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-800 mb-6">
            <TabsTrigger value="all" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              All Rounds
            </TabsTrigger>
            <TabsTrigger value="wins" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              Wins
            </TabsTrigger>
            <TabsTrigger value="losses" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              Losses
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filterTab} className="space-y-3">
            {filteredRounds.map((round) => (
              <Card key={round.id} className="card-elevated p-4 hover:border-emerald-500/40 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      round.status === 'won'
                        ? 'bg-emerald-500/20'
                        : 'bg-red-500/20'
                    }`}>
                      {round.status === 'won' ? (
                        <Trophy className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">Round #{round.id}</p>
                      <p className="text-sm text-slate-400">{round.players} players • {round.timestamp}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-400">Entered: {round.amountEntered} USDC</p>
                    <p className={`font-semibold ${
                      round.status === 'won'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}>
                      {round.status === 'won' ? `+${round.amountWon.toLocaleString()}` : `−${round.amountEntered}`} USDC
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
