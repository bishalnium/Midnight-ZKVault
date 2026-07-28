import { useState, useCallback } from 'react';

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  network: string | null;
  walletName: string | null;
  error: string | null;
}

export function useMidnight() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    network: null,
    walletName: null,
    error: null,
  });

  const checkWalletInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const globalObj = window as any;
    const m = globalObj.midnight;
    return !!(m?.lace || m?.mnLace || globalObj.cardano?.lace);
  }, []);

  const connectWallet = async () => {
    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      if (typeof window === 'undefined') throw new Error('Browser window not found');
      const globalObj = window as any;
      const m = globalObj.midnight;

      const walletProvider = m?.lace || m?.mnLace || globalObj.cardano?.lace;

      if (!walletProvider) {
        throw new Error('Lace Wallet extension is not installed or enabled in your browser.');
      }

      let api: any = null;
      if (typeof walletProvider.connect === 'function') {
        api = await walletProvider.connect('preprod');
      } else if (typeof walletProvider.enable === 'function') {
        api = await walletProvider.enable();
      }

      const state = api ? await api.state?.().catch(() => null) : null;
      const address = state?.unshieldedAddress || state?.address || null;

      if (!address) {
        throw new Error('Could not retrieve address from connected wallet.');
      }

      setWalletState({
        isConnected: true,
        isConnecting: false,
        address: address,
        network: 'Midnight Preprod',
        walletName: 'Lace Wallet',
        error: null,
      });
    } catch (err: any) {
      console.warn('Lace Wallet connection failed:', err.message);
      setWalletState({
        isConnected: false,
        isConnecting: false,
        address: null,
        network: null,
        walletName: null,
        error: err.message,
      });
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      isConnecting: false,
      address: null,
      network: null,
      walletName: null,
      error: null,
    });
  };

  return {
    ...walletState,
    isInstalled: checkWalletInstalled(),
    connectWallet,
    disconnectWallet,
  };
}
