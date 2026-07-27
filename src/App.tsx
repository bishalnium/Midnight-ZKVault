import React from 'react';
import { useMidnight } from './hooks/useMidnight';
import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';
import { Shield, Sparkles, ExternalLink, Github, Lock } from 'lucide-react';

const PREPROD_CONTRACT_ADDRESS = '0x498a9d1872b4c10e6a9f37c2d1045b82e91241a0';

export function App() {
  const midnight = useMidnight();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white flex items-center space-x-2">
                <span>Midnight ZKVault</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Level 2
                </span>
              </h1>
              <p className="text-xs text-slate-400">Zero-Knowledge DApp Integration</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/bishalnium/Midnight-ZKVault"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub Repo</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-5xl mx-auto px-4 py-10 w-full space-y-8 flex-1">
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 border border-purple-500/20 rounded-3xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rise In Midnight Challenge — Level 2</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy-Preserving Secret Vault & Proof Engine
          </h2>

          <p className="text-slate-300 max-w-2xl mx-auto text-sm leading-relaxed">
            Connect your 1AM / 1AIM wallet on Midnight Preprod to generate local Zero-Knowledge proofs. Prove vault secret authorization on-chain without ever revealing private user inputs.
          </p>
        </div>

        {/* Grid Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Step 3: Wallet Connect Component */}
          <WalletConnect
            isConnected={midnight.isConnected}
            isConnecting={midnight.isConnecting}
            address={midnight.address}
            network={midnight.network}
            walletName={midnight.walletName}
            error={midnight.error}
            isInstalled={midnight.isInstalled}
            onConnect={midnight.connectWallet}
            onDisconnect={midnight.disconnectWallet}
          />

          {/* Step 4: Circuit Call Component */}
          <CircuitCall
            contractAddress={PREPROD_CONTRACT_ADDRESS}
            isConnected={midnight.isConnected}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Midnight ZKVault © 2026 — Built for Midnight Builder Challenge Level 2</span>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Preprod Contract: <code className="text-purple-400">0x498a...41a0</code></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
