import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';

// USDC ABI (simplified to only include the balanceOf function)
const USDC_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];

// Get USDC address from environment variable
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;

export function useUSDCBalance() {
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      const wallet = wallets[0];
      if (!wallet) {
        setBalance(null);
        setLoading(false);
        return;
      }

      if (!USDC_ADDRESS) {
        setError("USDC contract address is not configured. Please set NEXT_PUBLIC_USDC_ADDRESS environment variable.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const provider = await wallet.getEthereumProvider();
        const ethersProvider = new ethers.BrowserProvider(provider);
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, ethersProvider);

        const walletAddress = wallet.address;
        const rawBalance = await usdcContract.balanceOf(walletAddress);

        // USDC has 6 decimal places
        const formattedBalance = ethers.formatUnits(rawBalance, 6);
        setBalance(formattedBalance);
      } catch (err) {
        console.error("Failed to fetch USDC balance:", err);
        setError("Failed to fetch balance.");
        setBalance(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, [wallets]); // Re-fetch when user object changes

  return { balance, loading, error };
}
