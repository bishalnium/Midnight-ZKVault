import React, { useRef, useState } from 'react';
import { Upload, Shield, Cpu, Lock } from 'lucide-react';
import { useMidnight } from '../hooks/useMidnight';
import { WalletConnect } from './WalletConnect';
import { CircuitCall } from './CircuitCall';

interface NavButtonProps {
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ label }) => {
  return (
    <button
      type="button"
      className="bg-transparent border-none cursor-pointer font-sans text-[15px] font-medium uppercase text-wandor-text tracking-[0.04em] transition-opacity hover:opacity-55"
    >
      {label}
    </button>
  );
};

export const Hero: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMidnightModal, setShowMidnightModal] = useState(false);
  const midnight = useMidnight();

  const PREPROD_CONTRACT_ADDRESS = '0x498a9d1872b4c10e6a9f37c2d1045b82e91241a0';

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      {/* Background Video (z-0) */}
      <video
        src="https://pollen-batch-41236914.figma.site/_components/v2/f0ee2dae7671c170c34f12e31c4cb41418976c98/769c564298c132f7919405cd9f17c1b1231f341d.769c5642.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Top Gradient Overlay (z-1) */}
      <div
        className="absolute inset-x-0 top-0 h-[687px] pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
        }}
      />

      {/* Content Wrapper (z-2) */}
      <div className="relative z-[2] max-w-[1360px] mx-auto flex flex-col justify-between min-h-svh">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between px-20 pt-6 pb-4 max-md:px-6 max-md:pt-5 relative">
          {/* Left Wordmark */}
          <span className="font-display text-[40px] max-md:text-[32px] text-black leading-none select-none">
            wandor
          </span>

          {/* Center Links */}
          <div className="max-md:hidden absolute left-1/2 -translate-x-1/2 flex gap-8">
            <NavButton label="Discover" />
            <NavButton label="Pricing" />
            <NavButton label="FAQs" />
          </div>

          {/* Right Flex Group */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              className="max-md:hidden bg-transparent border-none cursor-pointer font-sans text-[15px] font-semibold uppercase text-[#292929] tracking-[0.04em] transition-opacity hover:opacity-55"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setShowMidnightModal(true)}
              className="bg-wandor-dark text-[#fafafa] border-none cursor-pointer font-sans text-[15px] font-medium uppercase tracking-[0.04em] px-5 py-3.5 rounded-full transition-all hover:bg-[#333] active:scale-95 flex items-center space-x-2"
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Plan My Trip</span>
            </button>
          </div>
        </nav>

        {/* Hero Body */}
        <div className="flex flex-col items-center px-6 pt-16 pb-24 text-center my-auto">
          {/* Headline */}
          <h1 className="font-sans text-[clamp(40px,6vw,68px)] font-medium text-wandor-text leading-[1.05] tracking-[-0.04em] max-w-[820px] mb-5">
            Where will you go next?
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-xl font-medium text-wandor-muted leading-relaxed max-w-[500px] mb-10">
            Tell our AI where you're going and what you love. We'll create a personalized itinerary for you.
          </p>

          {/* Liquid Glass Prompt Card */}
          <div className="relative w-[701px] max-md:w-[calc(100vw-48px)] min-h-[208px] bg-white/[0.06] border-[3px] border-white rounded-[44px] shadow-[0_0_4px_0_rgba(0,0,0,0.15)] overflow-hidden backdrop-blur-[20px]">
            {/* Prompt Text */}
            <p className="absolute left-[29px] top-[57px] -translate-y-1/2 w-[609px] max-md:w-[calc(100%-58px)] font-sans text-xl max-md:text-[17px] font-medium text-wandor-prompt leading-relaxed break-words text-left">
              I'm planning a 7-day trip to Japan in October. I love food, hidden cafes, scenic hikes, and want to avoid crowds....
            </p>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
            />

            {/* Upload Button */}
            <button
              type="button"
              onClick={handleUploadClick}
              aria-label="Upload inspiration"
              className="absolute left-[21px] top-[137px] w-11 h-11 bg-transparent border border-white/70 rounded-full cursor-pointer flex items-center justify-center backdrop-blur-[14px] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              <Upload className="w-[18px] h-[18px] text-wandor-text flex-shrink-0" />
            </button>

            {/* Plan My Trip CTA inside card */}
            <button
              type="button"
              onClick={() => setShowMidnightModal(true)}
              className="absolute bottom-[21px] right-[21px] w-[156px] h-14 bg-black border-none rounded-[44px] shadow-[0_0_2px_0_rgba(0,0,0,0.05)] cursor-pointer flex items-center justify-center font-sans text-base font-medium text-[#fafafa] uppercase tracking-[0.02em] transition-all hover:bg-[#333] active:scale-95"
            >
              Plan My Trip
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="py-4 text-center text-xs text-wandor-muted font-sans z-[2]">
          <span>Wandor Privacy Protocol © 2026 — Powered by Midnight Network & Zero-Knowledge Proofs</span>
        </div>
      </div>

      {/* Midnight ZK Prover Modal Overlay */}
      {showMidnightModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-purple-500/30 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Midnight ZK Proof & Wallet Portal</h3>
                  <p className="text-xs text-slate-400">Level 2 Integration — 1AM / 1AIM & Lace Connector</p>
                </div>
              </div>
              <button
                onClick={() => setShowMidnightModal(false)}
                className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <CircuitCall
                contractAddress={PREPROD_CONTRACT_ADDRESS}
                isConnected={midnight.isConnected}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
