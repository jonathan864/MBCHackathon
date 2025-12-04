# AgentGuard Sandbox

A full-stack TypeScript web3 project that lets AI trading bot builders define their own guardrail policies (risk rules) and evaluate trade "intents" against those policies via an API.

## Overview

AgentGuard Sandbox provides a comprehensive framework for testing and validating AI trading agent behavior before deploying them to production. Define custom policy rules, simulate agent trades, and track evaluation results in real-time.

## Architecture

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes for policies, evaluation, and logs
- **Database**: Supabase (PostgreSQL) for persistent storage
- **Smart Contracts**: Hardhat + Solidity for AgentSafeWallet on Base Sepolia
- **Policy Engine**: Pure TypeScript evaluation engine

## Features

### Policy Management
- Define custom guardrail policies with multiple rule types:
  - **maxSize**: Limit maximum position size
  - **perMarketCap**: Set per-market exposure caps
  - **whitelistMarkets**: Restrict trading to approved markets
- Create, view, and manage policies through intuitive UI

### Agent Evaluation
- Simulate AI trading agent behavior
- Evaluate trade intents against defined policies
- Real-time decision logging (Allowed/Blocked)
- Comprehensive evaluation history

### Smart Contract
- Minimal AgentSafeWallet contract on Base Sepolia
- Owner and executor roles
- Safe transfer execution with balance checks

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Supabase account (already configured in this project)
- Base Sepolia RPC URL and private key (for contract deployment)

### Installation

```bash
npm install
```

### Environment Setup

The project includes a `.env` file with Supabase credentials already configured. For smart contract deployment, add to `.env`:

```bash
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
```

See `.env.example` for reference.

### Seed Default Policies (Optional)

To create some example policies:

```bash
npx tsx scripts/seed-policies.ts
```

### Running the Application

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

### Smart Contract Development

**Note**: Hardhat requires `"type": "module"` in package.json. To work with Hardhat:

1. Temporarily enable ESM:
```bash
npm pkg set type="module"
```

2. Compile contracts:
```bash
npx hardhat compile
```

3. Deploy to Base Sepolia:
```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

4. Restore for Next.js:
```bash
npm pkg delete type
```

Alternatively, use a separate Hardhat project directory for contract development.

## API Overview

### Endpoints

#### `GET /api/policies`
Fetch all policies.

**Response:**
```json
{
  "policies": [
    {
      "id": "uuid",
      "name": "Conservative Policy",
      "rules": [
        { "type": "maxSize", "max": 50 }
      ]
    }
  ]
}
```

#### `POST /api/policies`
Create a new policy.

**Request:**
```json
{
  "name": "My Policy",
  "rules": [
    { "type": "maxSize", "max": 100 },
    { "type": "whitelistMarkets", "allowedIds": ["election-2024", "btc-price"] }
  ]
}
```

#### `POST /api/evaluate`
Evaluate a trade intent against a policy.

**Request:**
```json
{
  "policyId": "uuid",
  "intent": {
    "marketId": "election-2024",
    "side": "YES",
    "size": 75
  }
}
```

**Response:**
```json
{
  "result": {
    "allowed": true,
    "reason": "All rules passed"
  }
}
```

#### `GET /api/logs`
Fetch recent evaluation logs.

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "policyId": "uuid",
      "intent": { "marketId": "btc-price", "side": "NO", "size": 50 },
      "result": { "allowed": false, "reason": "Market not in whitelist" },
      "timestamp": "2025-12-02T19:00:00Z"
    }
  ]
}
```

#### `POST /api/agent/run`
Simulate an AI agent proposing a trade.

**Response:**
```json
{
  "intent": {
    "marketId": "sports-final",
    "side": "YES",
    "size": 42
  },
  "result": {
    "allowed": true,
    "reason": "All rules passed"
  },
  "policyUsed": "Conservative Policy"
}
```

## Project Structure

```
/
├── agent/
│   ├── types.ts              # TypeScript types for Policy, Rule, Intent, etc.
│   ├── policyEngine.ts       # Core policy evaluation logic
│   └── exampleAgent.ts       # Simulated AI agent
├── app/
│   ├── api/
│   │   ├── policies/route.ts # Policy CRUD endpoints
│   │   ├── evaluate/route.ts # Intent evaluation endpoint
│   │   ├── logs/route.ts     # Evaluation logs endpoint
│   │   └── agent/run/route.ts # Agent simulation endpoint
│   ├── dashboard/page.tsx    # Main dashboard UI
│   ├── policies/page.tsx     # Policy management UI
│   ├── layout.tsx            # Root layout with navigation
│   └── page.tsx              # Home redirect
├── contracts/
│   └── AgentSafeWallet.sol   # Solidity smart contract
├── scripts/
│   └── deploy.ts             # Hardhat deployment script
├── lib/
│   ├── supabase.ts           # Supabase client setup
│   └── utils.ts              # Utility functions
├── hardhat.config.ts         # Hardhat configuration
├── package.json
├── tsconfig.json
└── .env                      # Environment variables
```

## Integrating Your Bot

To integrate your AI trading bot with AgentGuard:

1. **Create a Policy**: Use the UI or POST to `/api/policies` to define your risk rules
2. **Before Trading**: Send each trade intent to `/api/evaluate` with your policy ID
3. **Check Response**: Only execute trades when `result.allowed === true`
4. **Monitor Logs**: Review evaluation history via `/api/logs` or the dashboard

Example integration:

```typescript
const response = await fetch('/api/evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    policyId: 'your-policy-id',
    intent: {
      marketId: 'some-market',
      side: 'YES',
      size: 100
    }
  })
});

const { result } = await response.json();

if (result.allowed) {
  // Execute trade
} else {
  console.log('Trade blocked:', result.reason);
}
```

## Database Schema

The project uses Supabase with the following tables:

### `policies`
- `id` (uuid, primary key)
- `name` (text)
- `rules` (jsonb)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### `evaluation_logs`
- `id` (uuid, primary key)
- `policy_id` (uuid, foreign key)
- `intent` (jsonb)
- `result` (jsonb)
- `timestamp` (timestamptz)
- `created_at` (timestamptz)

## Smart Contract Details

**AgentSafeWallet.sol** provides a minimal safe wallet with:
- Owner and executor roles
- Owner can update executor
- Executor can execute ETH transfers
- Balance validation before transfers

Deployed on Base Sepolia testnet.

## Development

Type checking:

```bash
npm run typecheck
```

Linting:

```bash
npm run lint
```

Build:

```bash
npm run build
```

## Tech Stack

- **Framework**: Next.js 13.5.1
- **Language**: TypeScript 5.2.2
- **Database**: Supabase (PostgreSQL)
- **Smart Contracts**: Solidity 0.8.24, Hardhat
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Contributing

This is a hackathon project designed for rapid prototyping. For production use:
- Implement proper authentication
- Add stricter RLS policies
- Enhance error handling
- Add comprehensive testing
- Implement rate limiting
- Add monitoring and alerting

## License

MIT
