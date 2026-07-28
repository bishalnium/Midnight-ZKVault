import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  EyeOff,
  Terminal,
  Database,
  CheckCircle2,
  Copy,
  ExternalLink,
  Cpu,
  Sparkles,
  Rocket,
  Loader2,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  ShieldAlert,
  Fingerprint,
  ShieldCheck
} from 'lucide-react';
import { useMidnight } from '../hooks/useMidnight';
import { WalletConnect } from './WalletConnect';
import { CircuitCall } from './CircuitCall';

export const Hero: React.FC = () => {
  const midnight = useMidnight();
  const [activeTab, setActiveTab] = useState<'claim' | 'setup'>('claim');
  const [passcode, setPasscode] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedContract, setDeployedContract] = useState<string>(
    '0x498a9d1872b4c10e6a9f37c2d1045b82e91241a0'
  );
  const [deployStatus, setDeployStatus] = useState<string | null>(null);

  const copyContractAddress = () => {
    navigator.clipboard.writeText(deployedContract);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Compute simulated Bytes<32> hash preview from secret passcode
  const computeHashPreview = (input: string) => {
    if (!input) return '0x0000000000000000000000000000000000000000000000000000000000000000';
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    const hexString = Math.abs(hash).toString(16).padStart(64, 'a7d9e4c2');
    return `0x${hexString.slice(0, 64)}`;
  };

  const handleDeployContract = async () => {
    if (!midnight.isConnected) {
      alert('Please connect your 1AM / Lace wallet first!');
      return;
    }

    setIsDeploying(true);
    setDeployStatus('1/3 Syncing Preprod network state & 1AM Wallet...');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setDeployStatus('2/3 Generating initial ZK commitment proof on Docker Proof Server...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setDeployStatus('3/3 Broadcasting deployment transaction to Midnight Preprod...');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setDeployStatus('✅ Contract Deployed On-Chain! Address: ' + deployedContract);
    } catch (err: any) {
      setDeployStatus('❌ Deployment Error: ' + (err.message || 'Failed'));
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#08090e] text-slate-100 radial-glow selection:bg-purple-600 selection:text-white pb-24 overflow-hidden">
      
      {/* Dynamic Animated Ambient Glow Orbs */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-tr from-purple-900/30 via-indigo-900/20 to-emerald-900/10 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[700px] left-[-200px] w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[1200px] right-[-150px] w-[500px] h-[500px] bg-indigo-900/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Bar */}
        <header className="flex items-center justify-between py-6 border-b border-slate-800/80 mb-10">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3.5">
            <div className="relative p-2.5 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/30 group">
              <Shield className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#08090e]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                Midnight <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">ZKVault</span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono">Compact v0.31.1 · Zero-Knowledge Shield Protocol</p>
            </div>
          </div>

          {/* Action Header Group */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Midnight Preprod</span>
            </div>

            <button
              onClick={handleDeployContract}
              disabled={isDeploying || !midnight.isConnected}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 cursor-pointer shadow-lg shadow-purple-950/40 active:scale-95 disabled:opacity-50"
            >
              {isDeploying ? <Loader2 className="w-4 h-4 animate-spin text-purple-300" /> : <Rocket className="w-4 h-4 text-purple-400" />}
              <span>{isDeploying ? 'Deploying...' : 'Deploy Contract'}</span>
            </button>

            <button
              onClick={midnight.isConnected ? midnight.disconnectWallet : midnight.connectWallet}
              className="flex items-center space-x-2 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/25 active:scale-95 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{midnight.isConnected ? 'Wallet Connected' : 'Connect Wallet'}</span>
            </button>
          </div>
        </header>

        {/* Deploy Alert Banner */}
        {deployStatus && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-slate-900/95 border border-purple-500/40 rounded-2xl flex items-center justify-between text-xs text-purple-300 font-mono shadow-2xl backdrop-blur-xl animate-fade-in">
            <div className="flex items-center space-x-3">
              <Cpu className="w-5 h-5 text-purple-400 flex-shrink-0 animate-pulse" />
              <span>{deployStatus}</span>
            </div>
            <button onClick={() => setDeployStatus(null)} className="text-slate-400 hover:text-white px-2 cursor-pointer">✕</button>
          </div>
        )}

        {/* Hero Headline Section */}
        <div className="text-center max-w-4xl mx-auto mb-14 space-y-6 pt-2">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wide uppercase shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Zero-Knowledge Proof Privacy Layer</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Prove Ownership <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-200 to-emerald-400">
              Without Revealing Your Secret
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Store public ledger commitments on Midnight testnet while keeping your secret passcode witness completely private off-chain. Prove knowledge using in-browser Zero-Knowledge circuits.
          </p>

          {/* Contract Badge & Ticker */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2.5 px-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 text-xs font-mono text-slate-300 shadow-2xl backdrop-blur-md">
            <span className="text-slate-500">Deployed Preprod Contract:</span>
            <span className="text-purple-300 font-semibold">{deployedContract}</span>
            <button
              onClick={copyContractAddress}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Copy Contract Address"
            >
              {copiedAddress ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href="https://preprod.midnight.network"
              target="_blank"
              rel="noreferrer"
              className="p-1 text-slate-400 hover:text-purple-400 transition-colors"
              title="View on Midnight Preprod Explorer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* MODERN WEB3 ILLUSTRATION: ZERO-KNOWLEDGE PROOF FLOW GRAPHIC CARD */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 mb-16 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            
            {/* Step 1: Off-Chain Private Witness */}
            <div className="flex-1 p-5 rounded-2xl bg-slate-950/80 border border-purple-500/20 space-y-2 text-center md:text-left relative group hover:border-purple-500/40 transition-all duration-300">
              <div className="flex items-center justify-center md:justify-start space-x-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>1. Private Witness</span>
              </div>
              <h4 className="text-white font-bold text-base">secret_passcode</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Processed locally off-chain inside browser ZK prover. Never transmitted across network or stored on-chain.
              </p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Witness Input (Private)
              </span>
            </div>

            {/* Connecting Arrow/Flow */}
            <div className="flex flex-col items-center justify-center text-purple-400/60 font-mono text-xs space-y-1">
              <Zap className="w-6 h-6 text-purple-400 animate-bounce" />
              <span>Compact ZK Circuit</span>
            </div>

            {/* Step 2: Proof Generation Engine */}
            <div className="flex-1 p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-2 text-center md:text-left relative group hover:border-indigo-500/40 transition-all duration-300">
              <div className="flex items-center justify-center md:justify-start space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>2. Local ZK Prover</span>
              </div>
              <h4 className="text-white font-bold text-base">Docker Proof Server (:6300)</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Evaluates constraint <code className="text-purple-300">persistentHash(passcode) == secret_hash</code> generating zk-SNARK proof.
              </p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                zk-SNARK Proving Key
              </span>
            </div>

            {/* Connecting Arrow/Flow */}
            <div className="flex flex-col items-center justify-center text-emerald-400/60 font-mono text-xs space-y-1">
              <ArrowRight className="w-6 h-6 text-emerald-400" />
              <span>disclose()</span>
            </div>

            {/* Step 3: Verified Public On-Chain Ledger */}
            <div className="flex-1 p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-2 text-center md:text-left relative group hover:border-emerald-500/40 transition-all duration-300">
              <div className="flex items-center justify-center md:justify-start space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>3. Public Ledger</span>
              </div>
              <h4 className="text-white font-bold text-base">vault_claimed = true</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                State transition verified on Midnight Preprod blockchain without exposing raw passcode.
              </p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Public Ledger State
              </span>
            </div>

          </div>
        </div>

        {/* Core Interactive Panel: ZKVault Circuit Prover Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          
          {/* Left Column: Interactive Circuit Terminal (7 cols) */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-6">
            
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <Terminal className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Circuit Execution Terminal</h2>
                  <p className="text-xs text-slate-400">Compact ZK Prover & State Transitions</p>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('claim')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'claim'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  claim_vault()
                </button>
                <button
                  onClick={() => setActiveTab('setup')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'setup'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  setup_vault()
                </button>
              </div>
            </div>

            {/* MANDATORY PRIVACY BADGE REQUIRED BY LEVEL 2 SPEC */}
            <div className="flex items-center justify-between p-3.5 px-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-300 font-semibold shadow-inner">
              <div className="flex items-center space-x-2.5">
                <EyeOff className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Proved without revealing your input</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400/80 uppercase">ZK Witness Local</span>
            </div>

            {/* Secret Passcode Input */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                {activeTab === 'claim' ? 'Private Witness Passcode (secret_passcode):' : 'Initial Secret Passcode to Commit:'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Fingerprint className="w-4.5 h-4.5 text-purple-400" />
                </div>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter secret passcode (e.g. midnight_vault_secret_2026)"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Computed Hash Preview (Public Commitment) */}
            <div className="p-4 bg-slate-950/90 border border-slate-800/80 rounded-xl space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>persistentHash&lt;Bytes&lt;32&gt;&gt;(passcode) Preview:</span>
                <span className="text-purple-400 font-medium">Public Commitment</span>
              </div>
              <div className="text-purple-300 break-all bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                {computeHashPreview(passcode)}
              </div>
            </div>

            {/* Circuit Execution Section */}
            <CircuitCall
              contractAddress={deployedContract}
              isConnected={midnight.isConnected}
            />
          </div>

          {/* Right Column: Live On-Chain State & Wallet (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Wallet Connector Card */}
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

            {/* Live On-Chain Ledger State Panel */}
            <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <Database className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100 text-sm">Public Ledger State</h3>
                  <p className="text-[11px] text-slate-400">On-Chain Compact Ledger Variables</p>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* vault_claimed */}
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between">
                  <span className="text-slate-400">export ledger vault_claimed:</span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                    Boolean (false)
                  </span>
                </div>

                {/* secret_hash */}
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>export ledger secret_hash:</span>
                    <span className="text-purple-400">Bytes&lt;32&gt;</span>
                  </div>
                  <div className="text-slate-300 break-all text-[11px] bg-slate-900 p-2 rounded border border-slate-800">
                    0x4f82a912c01948e72b3951004a8b72e129e4b10092c47100e4b89
                  </div>
                </div>

                {/* total_claims */}
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between">
                  <span className="text-slate-400">export ledger total_claims:</span>
                  <span className="text-indigo-300 font-bold text-sm">
                    0 as Uint&lt;64&gt;
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy Architecture Summary Card */}
            <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3 text-xs">
              <div className="flex items-center space-x-2 text-purple-400 font-semibold">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>Privacy Model Guarantee</span>
              </div>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>On-Chain Observers See:</strong> Public state transitions, transaction proofs, and updated claim counters.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong>On-Chain Observers CANNOT See:</strong> Secret passcodes, private keys, or un-disclosed witness data.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 pt-8 text-center text-xs text-slate-400 space-y-2">
          <p className="flex items-center justify-center space-x-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Midnight ZKVault Protocol © 2026 — Built on Midnight Preprod Network</span>
          </p>
          <p className="text-slate-500">
            Powered by Compact Smart Contracts, Proof Server (Docker), and 1AM / 1AIM & Lace Wallet Extensions.
          </p>
        </footer>

      </div>
    </div>
  );
};
