import React from 'react';
import { Wallet, LogOut, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

interface WalletConnectProps {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  network: string | null;
  error: string | null;
  isInstalled: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  isConnected,
  isConnecting,
  address,
  network,
  error,
  isInstalled,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Wallet className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-100">Lace Midnight Wallet</h3>
            <p className="text-xs text-slate-400">Preprod DApp Connector</p>
          </div>
        </div>

        {/* Status Badge */}
        {isConnected ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            Disconnected
          </span>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start space-x-3 text-amber-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Connected State UI */}
      {isConnected ? (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Connected Address</span>
              <span className="text-indigo-400 font-mono">{network || 'Preprod Testnet'}</span>
            </div>
            <div className="font-mono text-sm text-slate-200 break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              {address}
            </div>
          </div>

          <button
            onClick={onDisconnect}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition duration-200 border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect Wallet</span>
          </button>
        </div>
      ) : (
        /* Disconnected State UI */
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Connect your Lace browser wallet extension to sign zero-knowledge proofs on the Midnight Preprod network.
          </p>

          <button
            onClick={onConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            <Shield className="w-5 h-5" />
            <span>{isConnecting ? 'Connecting to Lace...' : 'Connect Lace Wallet'}</span>
          </button>

          {!isInstalled && (
            <p className="text-xs text-center text-slate-500">
              Don't have Lace Wallet? Install it from{' '}
              <a
                href="https://www.lace.io/"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline"
              >
                lace.io
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
