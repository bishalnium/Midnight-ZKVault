import React from 'react';
import { Wallet, LogOut, AlertCircle, CheckCircle2, Shield, Lock } from 'lucide-react';

interface WalletConnectProps {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  network: string | null;
  walletName: string | null;
  activeWalletType: 'lace' | '1am' | null;
  error: string | null;
  isInstalled: boolean;
  onConnect: (target?: 'lace' | '1am') => void;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  isConnected,
  isConnecting,
  address,
  network,
  walletName,
  activeWalletType,
  error,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <Wallet className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">
              {isConnected ? (walletName || 'Connected Wallet') : 'Midnight Wallet Connection'}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">DApp Connector API (`window.midnight`)</p>
          </div>
        </div>

        {/* Status Badge */}
        {isConnected ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Disconnected
          </span>
        )}
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-3 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Connected State View */}
      {isConnected ? (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-2xl space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Active Wallet</span>
              <span className="text-purple-300 font-bold">{walletName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Network Target</span>
              <span className="text-emerald-400 font-bold">{network || 'Midnight Preprod'}</span>
            </div>
            <div className="text-slate-200 break-all text-[11px] bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-inner mt-2">
              {address}
            </div>
          </div>

          <button
            onClick={onDisconnect}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl transition duration-200 border border-slate-700 active:scale-98 cursor-pointer shadow-lg"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Disconnect Wallet</span>
          </button>
        </div>
      ) : (
        /* Disconnected State View: Dual Independent Wallet Connect Buttons */
        <div className="space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            Select your preferred Midnight wallet extension to sign zero-knowledge proofs. Only one wallet can be active at a time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Button 1: Lace Wallet */}
            <button
              onClick={() => onConnect('lace')}
              disabled={isConnecting || (isConnected && activeWalletType !== 'lace')}
              className={`flex items-center justify-center space-x-2 py-3 px-3.5 rounded-2xl text-xs font-bold transition-all duration-300 border cursor-pointer ${
                activeWalletType === 'lace' && isConnected
                  ? 'bg-purple-600 border-purple-400 text-white shadow-xl shadow-purple-600/30'
                  : 'bg-gradient-to-r from-purple-900/60 via-slate-900 to-purple-900/40 hover:from-purple-800/80 hover:to-indigo-900/60 border-purple-500/40 text-purple-200 hover:text-white shadow-lg'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Lace Wallet'}</span>
            </button>

            {/* Button 2: 1AM / 1AIM Wallet */}
            <button
              onClick={() => onConnect('1am')}
              disabled={isConnecting || (isConnected && activeWalletType !== '1am')}
              className={`flex items-center justify-center space-x-2 py-3 px-3.5 rounded-2xl text-xs font-bold transition-all duration-300 border cursor-pointer ${
                activeWalletType === '1am' && isConnected
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/30'
                  : 'bg-gradient-to-r from-indigo-900/60 via-slate-900 to-indigo-900/40 hover:from-indigo-800/80 hover:to-purple-900/60 border-indigo-500/40 text-indigo-200 hover:text-white shadow-lg'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>{isConnecting ? 'Connecting...' : 'Connect 1AM Wallet'}</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
