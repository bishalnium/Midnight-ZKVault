import { useState, useCallback, useEffect } from 'react';

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  network: string | null;
  walletName: string | null;
  error: string | null;
}

/**
 * Discover the first available Midnight wallet from window.midnight.
 * Lace injects under dynamic UUID keys, NOT fixed names like 'mnLace'.
 * We must enumerate Object.values(window.midnight) to find it.
 */
function discoverWallet(): { provider: any; name: string } | null {
  if (typeof window === 'undefined') return null;
  const globalObj = window as any;
  const m = globalObj.midnight;

  if (!m || typeof m !== 'object') return null;

  // Enumerate all injected wallet providers
  const entries = Object.entries(m);
  for (const [key, value] of entries) {
    if (value && typeof value === 'object') {
      const v = value as any;
      // A valid wallet provider will have enable() or connect()
      if (typeof v.enable === 'function' || typeof v.connect === 'function') {
        const name = v.name || v.walletName || (key.includes('lace') ? 'Lace Wallet' : `Midnight Wallet (${key.slice(0, 8)})`);
        return { provider: v, name };
      }
    }
  }
  return null;
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

  const [walletDetected, setWalletDetected] = useState(false);

  // Poll for wallet injection (extensions can inject after page load)
  useEffect(() => {
    const check = () => {
      const found = discoverWallet();
      if (found) {
        setWalletDetected(true);
        console.log(`[ZKVault] Detected wallet: ${found.name}`);
      }
    };

    // Check immediately
    check();

    // Re-check every 500ms for up to 5 seconds (extension may load late)
    const interval = setInterval(check, 500);
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const checkWalletInstalled = useCallback(() => {
    return discoverWallet() !== null;
  }, []);

  const connectWallet = async () => {
    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const wallet = discoverWallet();

      if (!wallet) {
        throw new Error(
          'No Midnight wallet detected. Please ensure Lace Wallet is installed, unlocked, and set to Midnight Preprod network, then refresh this page.'
        );
      }

      console.log(`[ZKVault] Connecting to ${wallet.name}...`);

      let api: any = null;

      // Lace uses .enable() to trigger the authorization popup
      if (typeof wallet.provider.enable === 'function') {
        api = await wallet.provider.enable();
      } else if (typeof wallet.provider.connect === 'function') {
        api = await wallet.provider.connect('preprod');
      }

      if (!api) {
        throw new Error('Wallet connection was rejected or returned no API.');
      }

      console.log('[ZKVault] Wallet API obtained, fetching state...');

      // Retrieve wallet state (address, balances)
      let address: string | null = null;
      if (typeof api.state === 'function') {
        const state = await api.state().catch(() => null);
        address = state?.unshieldedAddress || state?.address || null;
      }

      if (!address && typeof api.getUsedAddresses === 'function') {
        const addrs = await api.getUsedAddresses().catch(() => []);
        address = addrs?.[0] || null;
      }

      setWalletState({
        isConnected: true,
        isConnecting: false,
        address: address || 'Connected (address pending sync)',
        network: 'Midnight Preprod',
        walletName: wallet.name,
        error: null,
      });

      console.log(`[ZKVault] Connected! Address: ${address}`);
    } catch (err: any) {
      console.error('[ZKVault] Wallet connection failed:', err.message);
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
    isInstalled: walletDetected || checkWalletInstalled(),
    connectWallet,
    disconnectWallet,
  };
}
