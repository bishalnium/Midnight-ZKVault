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
    return !!(m?.mnLace || m?.lace || globalObj.cardano?.lace || m?.['1AM'] || m?.['1am']);
  }, []);

  const connectWallet = async () => {
    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      if (typeof window === 'undefined') throw new Error('Browser window not found');
      const globalObj = window as any;
      const m = globalObj.midnight;

      // Prioritize mnLace (standard injection key for Lace Midnight)
      const walletProvider = m?.mnLace || m?.lace || globalObj.cardano?.lace || m?.['1AM'] || m?.['1am'];

      const detectedName = (m?.mnLace || m?.lace || globalObj.cardano?.lace)
        ? 'Lace Wallet'
        : '1AM Wallet';

      if (!walletProvider) {
        throw new Error('Lace Wallet extension is not installed or enabled in your browser.');
      }

      console.log('Attempting to connect to wallet provider:', detectedName);

      let api: any = null;
      if (typeof walletProvider.enable === 'function') {
        api = await walletProvider.enable();
      } else if (typeof walletProvider.connect === 'function') {
        api = await walletProvider.connect('preprod');
      }

      if (!api) {
        throw new Error('Wallet connection rejected by user.');
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
        walletName: detectedName,
        error: null,
      });
    } catch (err: any) {
      console.error('Wallet connection failed:', err.message);
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
