# AgentGuard Sandbox  
### AI-Powered Trading Strategy Evaluator with On-Chain Logging + Polymarket Execution

AgentGuard Sandbox is a full-stack AI trading guardrail system that evaluates trade intents from autonomous agents, applies customizable safety policies, verifies liquidity conditions, logs approved decisions on Base Sepolia, and optionally executes trades on Polymarket (via dry-run or live CLOB orders).  
It provides a production-ready dashboard for monitoring agent behavior, testing policies, and observing the full decision lifecycle from evaluation → approval → on-chain logging → (optional) trade execution.

---

## 🚀 Features

- **AI-driven trade evaluation** using policy-based safety rules  
- **Configurable strategies** (Conservative, Aggressive, Category-Restricted, etc.)  
- **Full logging pipeline:**  
  - Evaluation results stored in Supabase  
  - Approved actions signed + logged to a deployed smart contract on Base Sepolia  
- **Polymarket Execution Engine:**  
  - Dry-run mode (safe, no real trading)  
  - Optional real trading with Polymarket CLOB  
- **Dashboard UI:**  
  - View evaluations  
  - Run simulated agent attempts  
  - Trigger on-chain logging  
  - View transaction receipts + BaseScan links  
- **Backend API routes** for evaluation, logging, and execution  
- **Built entirely inside Bolt and deployed automatically**

---

## 🏗 Architecture Overview
Agent → Strategy Evaluator (API) → Policy Engine → Decision:
├── Block → Store in Supabase
├── Allow:
├── Log On-Chain → Base Sepolia Smart Contract
└── Polymarket Executor:
├── Dry Run → Console + UI Badge
└── Live Trade → Polymarket CLOB Order
Dashboard UI → Reads from Supabase + Displays On-Chain Status

### Components
- **Frontend**: Next.js + Tailwind  
- **Backend**: Next.js API routes  
- **Database**: Supabase  
- **Smart Contract**: Simple logger contract deployed on Base Sepolia  
- **Trading Executor**: Polymarket CLOB Client  
- **Blockchain Toolkit**: viem  

---

## 📦 Tech Stack

| Layer | Tools |
|------|-------|
| Frontend | Next.js, TypeScript, Tailwind |
| Backend | Next.js API Routes |
| Database | Supabase |
| Blockchain | Base Sepolia, viem |
| Trading | @polymarket/clob-client |
| Hosting | Bolt |
| Version Control | GitHub |

---

## ⚙️ Installation & Setup

Clone the repo:

```bash
git clone https://github.com/jonathan864/MBCHackathon
cd MBCHackathon
npm install

Environment Variables

Create a .env.local file with the following:

SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
BASE_SEPOLIA_RPC_URL=...
NEXT_PUBLIC_AGENT_GUARD_LOGGER_ADDRESS=0x...
WALLET_PRIVATE_KEY=your_private_key (only if enabling live trading)
POLYMARKET_FUNDING_ADDRESS=0x...
POLYMARKET_TRADING_ENABLED=false
POLYMARKET_DEMO_TOKEN_ID=123456

Leave trading disabled unless you’re ready for real execution.

⸻

Deployed Smart Contract

A simple logger contract records each approved evaluation on-chain.

0xA655B27a7BEBC73e5888032C39a85d3870dF72f8  (Base Sepolia)

Running the App Locally

npm run dev
Navigate to:
http://localhost:3000

API Routes

Evaluate Strategy
POST /api/evaluate

Log Evaluation On-Chain
POST /api/onchain/log-evaluation

Polymarket Execution
POST /api/polymarket/execute

Polymarket Trading Modes

✔ Dry-Run Mode (default)
	•	No real money
	•	No API calls to Polymarket
	•	UI shows Simulated Trade ✓
	•	Console logs example orders

✔ Live Trading (optional)

Set in .env:
POLYMARKET_TRADING_ENABLED=true
Requires:
	•	Real Polymarket private key
	•	Funding address
	•	Real outcome token ID

⸻

Project Story (Summary)

AgentGuard began as an exploration into how autonomous agents could safely interact with real financial systems. The goal was to build a guardrail layer that evaluates trading intents, enforces human-defined policies, and only allows actions when conditions are safe and verifiable.

During development we built a complete pipeline: policy evaluation, real-time dashboard, on-chain audit trail, and a Polymarket trading executor with dry-run safety. Challenges included wallet signing, viem contract interactions, and ensuring Base Sepolia logging behaved predictably across UI and backend contexts. The result is a robust, end-to-end agent safety framework capable of responsibly supervising AI-based trading decisions.

	•	Expand trading connectors (Uniswap, Hyperliquid, Coinbase)
	•	Add automated agent replay simulation
	•	Build a risk-scoring model using evaluation history
	•	Enable continuous monitoring with alerts
