# AgentGuard Sandbox - Quick Start Guide

Get up and running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Verify Database

The database is already configured with Supabase. Tables are created automatically.

## 3. Seed Example Policies (Optional)

```bash
npx tsx scripts/seed-policies.ts
```

This creates three example policies:
- Conservative Trading Policy (max size: 50, restricted markets)
- Aggressive Trading Policy (max size: 200)
- Market Restricted Policy (whitelist only)

## 4. Start the Application

```bash
npm run dev
```

Visit http://localhost:3000

## 5. Try It Out

### Create Your First Policy

1. Go to "Policies" in the navigation
2. Enter a policy name (e.g., "My Test Policy")
3. Add rules:
   - **Max Size**: Set maximum position size (e.g., 100)
   - **Per Market Cap**: Set per-market exposure limit (e.g., 50)
   - **Whitelist Markets**: Comma-separated market IDs (e.g., election-2024, btc-price)
4. Click "Save Policy"

### Run the Example Agent

1. Go to "Dashboard"
2. Click "Run Agent Attempt"
3. The simulated agent will propose a random trade
4. See it evaluated against your policy in real-time
5. View the result (Allowed or Blocked) with reason

### Explore the API

#### Test Policy Creation
```bash
curl -X POST http://localhost:3000/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Policy",
    "rules": [
      {"type": "maxSize", "max": 75},
      {"type": "whitelistMarkets", "allowedIds": ["btc-price", "eth-price"]}
    ]
  }'
```

#### Test Intent Evaluation
```bash
curl -X POST http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "policyId": "YOUR_POLICY_ID",
    "intent": {
      "marketId": "btc-price",
      "side": "YES",
      "size": 50
    }
  }'
```

#### View Logs
```bash
curl http://localhost:3000/api/logs
```

## Next Steps

- **Customize Rules**: Add new rule types in `agent/types.ts` and `agent/policyEngine.ts`
- **Connect Your Bot**: Use the `/api/evaluate` endpoint to guard your AI agent
- **Deploy Contracts**: Set up Base Sepolia RPC and deploy `AgentSafeWallet.sol`
- **Enhance UI**: Customize the dashboard and policy builder

## Project Structure

```
agent/           # Policy engine and agent logic
├── types.ts
├── policyEngine.ts
└── exampleAgent.ts

app/             # Next.js pages and API routes
├── dashboard/   # Main dashboard UI
├── policies/    # Policy management UI
└── api/         # Backend API endpoints

contracts/       # Solidity smart contracts
scripts/         # Deployment and utility scripts
```

## Common Issues

### "No policies found" error when running agent
Create a policy first through the UI or run the seed script.

### API calls fail
Make sure the dev server is running (`npm run dev`).

### Build errors
Ensure you've run `npm install` and have Node.js 16+ installed.

## Smart Contract Development

The project includes a minimal `AgentSafeWallet` contract for Base Sepolia. See the main README for deployment instructions.

## Need Help?

- Check the API documentation in README.md
- Review example policies in `scripts/seed-policies.ts`
- Inspect the policy engine logic in `agent/policyEngine.ts`

Happy building!
