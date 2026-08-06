import { useState, useCallback, useEffect } from 'react';

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  network: string | null;
  walletName: string | null;
  activeWalletType: 'lace' | '1am' | null;
  error: string | null;
}

interface DiscoveredWallet {
  provider: any;
  name: string;
  type: 'lace' | '1am';
}

/**
 * Discover Midnight wallet providers from window.midnight.
 * Supports both Lace Wallet and 1AM / 1AIM Wallet extensions.
 */
function discoverWallets(): { lace?: DiscoveredWallet; oneAm?: DiscoveredWallet; anyWallet?: DiscoveredWallet } {
  if (typeof window === 'undefined') return {};
  const globalObj = window as any;
  const m = globalObj.midnight;

  if (!m || typeof m !== 'object') return {};

  const entries = Object.entries(m);
  let lace: DiscoveredWallet | undefined;
  let oneAm: DiscoveredWallet | undefined;
  let anyWallet: DiscoveredWallet | undefined;

  for (const [key, value] of entries) {
    if (value && typeof value === 'object') {
      const v = value as any;
      if (typeof v.enable === 'function' || typeof v.connect === 'function') {
        const keyLower = key.toLowerCase();
        const nameLower = (v.name || v.walletName || '').toLowerCase();

        const isLace = keyLower.includes('lace') || nameLower.includes('lace');
        const is1Am = keyLower.includes('1am') || keyLower.includes('1aim') || nameLower.includes('1am') || nameLower.includes('1aim');

        const type: 'lace' | '1am' = isLace ? 'lace' : is1Am ? '1am' : 'lace';
        const name = v.name || v.walletName || (type === 'lace' ? 'Lace Wallet' : '1AM / 1AIM Wallet');

        const walletObj = { provider: v, name, type };
        if (!anyWallet) anyWallet = walletObj;
        if (isLace && !lace) lace = walletObj;
        if (is1Am && !oneAm) oneAm = walletObj;
      }
    }
  }

  return { lace, oneAm, anyWallet };
}

export function useMidnight() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    network: null,
    walletName: null,
    activeWalletType: null,
    error: null,
  });

  const [walletDetected, setWalletDetected] = useState(false);

  useEffect(() => {
    const check = () => {
      const { anyWallet } = discoverWallets();
      if (anyWallet) {
        setWalletDetected(true);
      }
    };
    check();
    const interval = setInterval(check, 500);
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const checkWalletInstalled = useCallback(() => {
    const { anyWallet } = discoverWallets();
    return Boolean(anyWallet);
  }, []);

  const connectWallet = async (targetType?: 'lace' | '1am') => {
    setWalletState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const discovered = discoverWallets();
      let walletToConnect: DiscoveredWallet | undefined;

      if (targetType === 'lace') {
        walletToConnect = discovered.lace || (discovered.anyWallet?.type === 'lace' ? discovered.anyWallet : undefined);
      } else if (targetType === '1am') {
        walletToConnect = discovered.oneAm || (discovered.anyWallet?.type === '1am' ? discovered.anyWallet : undefined);
      } else {
        walletToConnect = discovered.anyWallet;
      }

      if (!walletToConnect) {
        const requiredName = targetType === '1am' ? '1AM / 1AIM Wallet' : targetType === 'lace' ? 'Lace Wallet' : 'Midnight Wallet';
        throw new Error(
          `${requiredName} extension not detected. Please make sure the ${requiredName} browser extension is installed, unlocked, and configured for Midnight Preprod network, then refresh.`
        );
      }

      console.log(`[ZKVault] Connecting to ${walletToConnect.name}...`);

      let api: any = null;
      if (typeof walletToConnect.provider.enable === 'function') {
        api = await walletToConnect.provider.enable();
      } else if (typeof walletToConnect.provider.connect === 'function') {
        api = await walletToConnect.provider.connect('preprod');
      }

      if (!api) {
        throw new Error('Wallet connection was rejected or returned no API object.');
      }

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
        walletName: walletToConnect.name,
        activeWalletType: walletToConnect.type,
        error: null,
      });

      console.log(`[ZKVault] Connected ${walletToConnect.name}! Address: ${address}`);
    } catch (err: any) {
      console.error('[ZKVault] Wallet connection error:', err.message);
      setWalletState({
        isConnected: false,
        isConnecting: false,
        address: null,
        network: null,
        walletName: null,
        activeWalletType: null,
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
      activeWalletType: null,
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
