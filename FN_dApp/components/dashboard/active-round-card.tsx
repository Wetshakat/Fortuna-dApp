'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Users } from 'lucide-react'

export function ActiveRoundCard() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  };

  return (
    <Card className="card-elevated p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Current Round</h3>
          <p className="text-slate-400 text-sm">Round #13</p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
          Active
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Users className="w-4 h-4" />
            Players
          </div>
          <p className="text-2xl font-bold text-white">0/50</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Clock className="w-4 h-4" />
            Time Left
          </div>
          <p className="text-2xl font-bold text-white">{formatTime(timeLeft)}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-slate-400 text-sm mb-1">Prize Pool</div>
          <p className="text-2xl font-bold text-emerald-400">0 USDC</p>
        </div>
      </div>

      <Button
        onClick={() => router.push('/active-round/1')}
        className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold"
      >
        View Details
      </Button>
    </Card>
  )
}
