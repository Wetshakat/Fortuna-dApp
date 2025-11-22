import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import { fortunaCoreAddress, fortunaCoreABI } from '@/lib/contracts';

export function useFortunaCore() {
  const { wallets } = useWallets();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const init = async () => {
      if (wallets[0]) {
        const provider = await wallets[0].getEthereumProvider();
        const ethersProvider = new ethers.BrowserProvider(provider);
        setContract(new ethers.Contract(fortunaCoreAddress, fortunaCoreABI, ethersProvider));
      }
    };
    init();
  }, [wallets]);

  return contract;
}
