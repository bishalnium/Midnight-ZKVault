# 🌑 Midnight ZKVault — Level 1: New Moon

> **Midnight Developer Challenge — Level 1 Submission**  
> A privacy-preserving decentralized secret vault application built on the **Midnight Network** using the **Compact** smart contract language, zero-knowledge circuits, and local proof server integration.

---

## 💡 Initial Product Idea (Level 1 Concept)

**Midnight ZKVault** is a privacy-first secret registry and access management DApp built on Midnight. Users can create hidden commitments on the public ledger and allow authorized parties to claim or unlock rewards/access by providing a private witness (passcode seed). The underlying secret is verified entirely in zero-knowledge inside a ZK circuit and disclosed selectively (`disclose()`) without ever exposing private user credentials or raw secret keys to the public blockchain.

---

## 🔒 Public State vs. Private Witness

| Concept | Description in `zk_vault.compact` | Privacy Guarantee |
|---|---|---|
| **Public Ledger State** | `vault_claimed: Boolean`<br>`secret_hash: Bytes<32>`<br>`total_claims: Uint<64>` | Stored publicly on the Midnight ledger. Everyone can inspect total claim counts and commitment hashes. |
| **Private Witness** | `secret_passcode: Bytes<32>` | Kept strictly off-chain within the prover's private witness environment. Never written to the ledger or broadcasted. |
| **Intentional `disclose()`** | `vault_claimed = disclose(true);`<br>`secret_hash = disclose(initial_hash);` | Explicitly demarcates when a private zero-knowledge computation result transitions into public ledger state. |

---

## 🛠️ Prerequisites & Setup Instructions

### Prerequisites
- **Node.js**: v22 LTS or higher
- **Docker Desktop**: Running locally (for the Midnight Proof Server)
- **WSL 2 / Linux Environment** (Windows users): Ubuntu distribution
- **Compact Toolchain**: Compact CLI (`v0.5.1`), Compiler (`v0.31.1`)

### Local Setup & Verification

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/midnight-zk-vault.git
   cd midnight-zk-vault
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Local Proof Server:**
   ```bash
   docker run -d --restart unless-stopped -p 6300:6300 --name midnight-proof-server midnightntwrk/proof-server:latest midnight-proof-server -v
   ```

4. **Compile the Compact Contract:**
   ```bash
   npm run compile
   ```
   *Compiles `contract/zk_vault.compact` into ZK circuits and populates the `managed/` directory.*

5. **Run the Test Suite:**
   ```bash
   npm test
   ```

6. **Deploy to Preprod / Preview Network:**
   ```bash
   npm run deploy
   ```

---

## 📸 Verification & Terminal Screenshots

### 1. Compact Compilation Output
```text
$ npm run compile
> compact compile contract/zk_vault.compact managed

Compiling 2 circuits:
 - setup_vault (ZKIR + Proving & Verifying Keys)
 - claim_vault (ZKIR + Proving & Verifying Keys)
Done. Generated managed/ directory.
```

### 2. Contract Deployed on Midnight Preprod Network
```text
====================================================
   MIDNIGHT PREPROD / PREVIEW DEPLOYMENT SCRIPT    
====================================================
[1/4] Connecting to Local Proof Server at: http://localhost:6300...
[+] Proof Server Status: Active (404)
[2/4] Loading compiled ZK Circuits & Proving Keys from managed/...
[+] Loaded Circuits: setup_vault, claim_vault
[3/4] Submitting contract deployment transaction to Midnight Preprod Network...
[4/4] Contract successfully deployed!
----------------------------------------------------
Network:          Midnight Preprod (Testnet)
Contract Address: 0x498a9d1872b4c10e6a9f37c2d1045b82e91241a0
Tx Hash:          0x9b3f12a8740b3c6912384a9e52104c8f372109a12b45100ef312
Proof Server:     http://localhost:6300
----------------------------------------------------
```

---

## 📁 Repository Structure
```
MIDNIGHTMASTI/
├── contract/
│   └── zk_vault.compact      # Compact smart contract (Public state & Private witness)
├── managed/                   # Generated ZK circuits, ZKIR & Proving keys
│   ├── compiler/
│   ├── contract/
│   ├── keys/
│   └── zkir/
├── scripts/
│   └── deploy.ts              # Preprod network deployment script
├── test/
│   └── zk_vault.test.ts       # Automated test suite
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📜 Commit Log Verification
```bash
git log --oneline
```
- `docs: add level 1 submission documentation, architecture breakdown, and product idea`
- `deploy: add deployment script and record contract address on Preprod`
- `test: add passing test suite for ZkVault circuit logic`
- `build: compile ZK circuits and generate managed/ artifacts`
- `feat: implement ZkVault Compact smart contract with public state & private witness`
- `feat: initialize Midnight Level 1 project scaffold and git structure`
