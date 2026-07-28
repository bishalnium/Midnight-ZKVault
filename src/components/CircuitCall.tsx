import React, { useState } from 'react';
import { Cpu, ShieldCheck, CheckCircle2, Lock, EyeOff, Loader2 } from 'lucide-react';

interface CircuitCallProps {
  contractAddress: string;
  isConnected: boolean;
}

export const CircuitCall: React.FC<CircuitCallProps> = ({
  contractAddress,
  isConnected,
}) => {
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [txResult, setTxResult] = useState<{
    txHash: string;
    status: string;
    timestamp: string;
    vaultStatus: string;
  } | null>(null);

  const handleExecuteCircuit = async () => {
    if (!isConnected) return;

    setIsGeneratingProof(true);
    setTxResult(null);

    try {
      console.log('Generating local zero-knowledge proof for claim_vault circuit...');
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const mockTxHash = '0x9b3f12a8740b3c6912384a9e52104c8f372109a12b45100ef312';

      setTxResult({
        txHash: mockTxHash,
        status: 'Confirmed on Midnight Preprod',
        timestamp: new Date().toLocaleTimeString(),
        vaultStatus: 'Vault successfully unlocked and verified',
      });
    } catch (err) {
      console.error('Circuit execution error:', err);
    } finally {
      setIsGeneratingProof(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <Cpu className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-100">Zero-Knowledge Proof Prover</h3>
            <p className="text-xs text-slate-400">Local Proving Key Generation</p>
          </div>
        </div>

        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <EyeOff className="w-3.5 h-3.5 mr-1.5" />
          Proved without revealing your input
        </span>
      </div>

      {/* Contract Reference */}
      <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-xs">
        <span className="text-slate-400">Active Contract State:</span>
        <div className="font-mono text-purple-300 break-all">{contractAddress}</div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="p-4 bg-slate-950/80 border border-purple-500/20 rounded-xl flex items-start space-x-3 text-xs text-slate-300">
        <Lock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-purple-300 font-semibold block mb-0.5">
            Zero-Knowledge Privacy Guarantee:
          </strong>
          Your secret passcode is processed locally inside your browser prover environment. The public ledger only records the mathematical verification proof — your private passcode never leaves your machine.
        </div>
      </div>

      {/* Execution Action Button */}
      <button
        onClick={handleExecuteCircuit}
        disabled={!isConnected || isGeneratingProof}
        className="w-full flex items-center justify-center space-x-2.5 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition duration-200 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isGeneratingProof ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-purple-200" />
            <span>Generating Verification Proof...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            <span>Unlock Secret Vault</span>
          </>
        )}
      </button>

      {/* Transaction Result Display */}
      {txResult && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between text-emerald-400 font-semibold">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Vault Unlocked Successfully</span>
            </span>
            <span className="text-slate-400 font-normal">{txResult.timestamp}</span>
          </div>

          <div className="space-y-1.5 font-mono text-slate-300 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500">Status: </span>
              <span className="text-emerald-400">{txResult.status}</span>
            </div>
            <div>
              <span className="text-slate-500">State: </span>
              <span className="text-purple-300">{txResult.vaultStatus}</span>
            </div>
            <div className="break-all">
              <span className="text-slate-500">Receipt Hash: </span>
              <span className="text-indigo-300">{txResult.txHash}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
