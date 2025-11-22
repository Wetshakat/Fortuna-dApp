import { useState, useEffect } from 'react';
import { useFortunaCore } from './use-fortuna-core';
import { useFortunaManager } from './use-fortuna-manager';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';

interface RoundInfo {
  currentPlayers: number;
  maxPlayers: number;
}

const EXPECTED_CHAIN_ID = 84532; // Base Sepolia

export function useRoundInfo(): { roundInfo: RoundInfo | null; loading: boolean; error: string | null } {
  const fortunaCore = useFortunaCore();
  const fortunaManager = useFortunaManager();
  const { wallets } = useWallets();
  const [roundInfo, setRoundInfo] = useState<RoundInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoundInfo() {
      if (!fortunaCore || !fortunaManager || !wallets[0]) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const provider = new ethers.BrowserProvider(await wallets[0].getEthereumProvider());
        const network = await provider.getNetwork();
        if (network.chainId !== BigInt(EXPECTED_CHAIN_ID)) {
          setError(`Please connect to Base Sepolia. You are currently on network ${network.name}.`);
          setLoading(false);
          return;
        }

        const currentRoundId = await fortunaCore.currentRoundId();
        const totalParticipants = await fortunaManager.totalParticipants(currentRoundId);
        const maxParticipants = await fortunaManager.getMaxParticipants(currentRoundId);

        setRoundInfo({
          currentPlayers: Number(totalParticipants),
          maxPlayers: Number(maxParticipants),
        });
      } catch (err) {
        console.error("Failed to fetch round info:", err);
        if (err instanceof Error) {
          setError(`Failed to fetch round info: ${err.message}`);
        } else {
          setError("Failed to fetch round info.");
        }
        setRoundInfo(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRoundInfo();
  }, [fortunaCore, fortunaManager, wallets]);

  return { roundInfo, loading, error };
}
