# Midnight ZKVault
> Privacy-preserving decentralized secret vault & zero-knowledge proof DApp built on Midnight.

---

## 🚀 Live Demo
**[https://midnight-zk-vault.vercel.app](https://midnight-zk-vault.vercel.app)** *(Deploy via Vercel CLI or GitHub Integration)*

---

## 📜 Contract Address
| Network  | Address                          |
|----------|----------------------------------|
| Preprod  | `32c51230f67779033c93094f9039a73c2416be4b848b2f8540959ec89213f0bd` |

*(Contract address is verified live on the Midnight Preprod Network).*

---

## 💡 What This Does
**Midnight ZKVault** is a privacy-preserving decentralized application built on the **Midnight Network** using the **Compact** smart contract language and **React + Vite**. It allows users to register secret commitments on the public ledger and authorize vault state transitions by proving ownership of a secret passcode witness inside an in-browser Zero-Knowledge (ZK) circuit.

---

## 🔒 Privacy Model
- **What is PUBLIC:** The `vault_claimed` boolean status, the `secret_hash` commitment on-chain, the `total_claims` counter, and verified state transition ZK proofs.
- **What is PRIVATE:** The `secret_passcode` witness value stored exclusively off-chain in the user's prover environment.
- **What the user PROVES without revealing:** The user proves mathematical knowledge of a secret passcode matching the public `secret_hash` commitment without revealing the raw secret passcode itself (`Proved without revealing your input`).

---

## 🛡️ Privacy Claim
- **What an on-chain observer sees:** The deployed contract address, the transaction hash, the mathematical ZK proof, and the updated state (`vault_claimed = true`).
- **What an on-chain observer CANNOT see:** The user's secret passcode, private key material, or any un-disclosed witness inputs.

---

## 🛠️ Tech Stack
- **Blockchain Network:** Midnight Preprod (Testnet)
- **Smart Contract Language:** Compact (`v0.31.1`)
- **SDK & DApp Connector:** `@midnight-ntwrk/dapp-connector-api`, `@midnight-ntwrk/midnight-js`, `@midnight-ntwrk/compact-runtime`
- **Frontend Framework:** React 18, Vite, Lucide Icons, TypeScript
- **Browser Wallet:** Lace Wallet Extension
- **Proof Generation Engine:** Docker Midnight Proof Server (`http://localhost:6300`)

---

## 📋 Prerequisites
- **Lace Wallet Extension:** Installed in Google Chrome (configured to Midnight Preprod / Local Proof Server `http://localhost:6300`)
- **Node.js:** `v22 LTS` or higher
- **Docker Desktop:** Running locally for zero-knowledge proof generation

---

## 💻 Run Locally

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/bishalnium/Midnight-ZKVault.git
   cd Midnight-ZKVault
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Local Proof Server (Docker):**
   ```bash
   docker run -d --restart unless-stopped -p 6300:6300 --name midnight-proof-server midnightntwrk/proof-server:latest midnight-proof-server -v
   ```

4. **Compile Compact Contracts into ZK Circuits:**
   ```bash
   npm run compile
   ```

5. **Run Test Suite:**
   ```bash
   npm test
   ```

6. **Start Frontend Development Server:**
   ```bash
   npm run dev
   ```

7. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📹 Demo Video
**[PLACEHOLDER — Record 2-minute demo video following checklist]**

---

## 📁 Level 2 File Structure
```
Midnight-ZKVault/
├── contract/
│   └── zk_vault.compact      # Compact smart contract
├── managed/                   # Generated ZK circuits & keys
├── src/
│   ├── components/
│   │   ├── WalletConnect.tsx  # Lace wallet connect/disconnect UI
│   │   └── CircuitCall.tsx    # Circuit call button & local ZK prover UI
│   ├── hooks/
│   │   └── useMidnight.ts     # DApp connector SDK hook
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── test/
│   └── zk_vault.test.ts       # Passing test suite
├── scripts/
│   └── deploy.ts              # Preprod deployment script
├── vercel.json                # Production deployment configuration
├── package.json
└── README.md
```
