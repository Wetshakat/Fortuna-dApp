import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import { fortunaManagerAddress, fortunaManagerABI } from '@/lib/contracts';

export function useFortunaManager() {
  const { wallets } = useWallets();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const init = async () => {
      if (wallets[0]) {
        const provider = await wallets[0].getEthereumProvider();
        const ethersProvider = new ethers.BrowserProvider(provider);
        setContract(new ethers.Contract(fortunaManagerAddress, fortunaManagerABI, ethersProvider));
      }
    };
    init();
  }, [wallets]);

  return contract;
}
