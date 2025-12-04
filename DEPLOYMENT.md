# Deployment Guide

## Production Deployment Checklist

### Frontend (Next.js App)

1. **Environment Variables**
   - Set `NEXT_PUBLIC_SUPABASE_URL`
   - Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - These are already configured for the current Supabase instance

2. **Build & Deploy**
   ```bash
   npm run build
   npm run start
   ```

3. **Recommended Platforms**
   - Vercel (optimal for Next.js)
   - Netlify
   - Railway
   - Render

### Database (Supabase)

The database is already configured and includes:

- `policies` table with RLS enabled
- `evaluation_logs` table with RLS enabled
- Proper indexes for performance

**Note**: Current RLS policies allow public access for hackathon purposes. For production:

1. Update RLS policies to require authentication
2. Implement user-specific policy access
3. Add rate limiting on evaluation endpoints

### Smart Contract (Base Sepolia)

1. **Setup Environment**
   ```bash
   # Add to .env
   BASE_SEPOLIA_RPC_URL=YOUR_BASE_SEPOLIA_RPC_URL_HERE
   AGENT_GUARD_PRIVATE_KEY=0x<your_private_key_here>
   ```

   **Note**:
   - The app reads `BASE_SEPOLIA_RPC_URL` and `AGENT_GUARD_PRIVATE_KEY` from `.env`
   - The contract address is configured in `lib/config/onchainConfig.ts`
   - Update `AGENT_GUARD_LOGGER_ADDRESS` in the config file after deployment

2. **Get Test ETH**
   - Visit Base Sepolia faucet
   - Fund your deployer address

3. **Deploy Contract**
   ```bash
   npm pkg set type="module"
   npx hardhat compile
   npx hardhat run scripts/deploy.ts --network baseSepolia
   npm pkg delete type
   ```

4. **Save Contract Address**
   - Copy the deployed contract address
   - Update `AGENT_GUARD_LOGGER_ADDRESS` in `lib/config/onchainConfig.ts`
   - Verify on BaseScan Sepolia

## Security Considerations

### For Production Use

1. **Authentication**
   - Add Supabase Auth to protect API routes
   - Require user authentication for policy management
   - Link policies to user accounts

2. **Rate Limiting**
   - Implement rate limiting on `/api/evaluate`
   - Protect against abuse of `/api/agent/run`
   - Use middleware or API gateway

3. **Input Validation**
   - Add Zod schemas for all API inputs
   - Validate intent data before evaluation
   - Sanitize user inputs

4. **RLS Policies**
   ```sql
   -- Example: User-specific policy access
   CREATE POLICY "Users can only view own policies"
     ON policies FOR SELECT
     TO authenticated
     USING (auth.uid() = user_id);
   ```

5. **API Keys & Secrets**
   - Never commit `.env` to git
   - Use environment variables for all secrets
   - Rotate keys regularly

6. **Monitoring**
   - Set up Supabase logging
   - Monitor API usage and errors
   - Track evaluation patterns

## Scaling Considerations

### Database

- Current setup handles ~10k requests/day easily
- Add indexes on frequently queried columns
- Consider archiving old evaluation logs
- Set up database backups

### API Routes

- Next.js API routes are serverless by default
- Scale automatically on Vercel
- For high traffic, consider:
  - Caching frequently used policies
  - Redis for session management
  - CDN for static assets

### Policy Engine

- Pure TypeScript evaluation is fast
- Can handle 1000+ evaluations/second
- For complex rules, consider:
  - Rule caching
  - Async evaluation queues
  - Separate microservice for evaluation

## Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics** (if using Vercel)
2. **Supabase Dashboard** for database metrics
3. **Sentry** for error tracking
4. **PostHog** or **Mixpanel** for user analytics

### Key Metrics to Track

- Evaluation latency
- Policy creation rate
- Agent success/failure rate
- API error rates
- Database query performance

## Backup & Recovery

1. **Database Backups**
   - Supabase provides automatic daily backups
   - Can restore from any point-in-time
   - Test restoration process

2. **Configuration Backups**
   - Keep `.env.example` updated
   - Document all environment variables
   - Version control all code

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run typecheck
      # Add deployment step for your platform
```

## Cost Estimates

### Supabase (Free Tier)
- 500 MB database storage
- 2 GB bandwidth
- 50,000 monthly active users
- Upgrade at $25/month for more

### Vercel (Hobby)
- Free for personal projects
- 100 GB bandwidth
- Automatic SSL
- Pro at $20/month

### Base Sepolia
- Testnet (free)
- For mainnet deployment, consider gas costs

## Support & Maintenance

1. **Weekly Tasks**
   - Review evaluation logs
   - Check error rates
   - Update dependencies

2. **Monthly Tasks**
   - Database cleanup
   - Security audit
   - Performance optimization

3. **Quarterly Tasks**
   - Major dependency updates
   - Security review
   - Feature planning

## Troubleshooting

### Common Issues

**Build Fails**
- Run `npm install` again
- Check Node.js version (16+)
- Clear `.next` folder

**Database Connection Errors**
- Verify Supabase URL and keys
- Check RLS policies
- Review Supabase logs

**API Timeouts**
- Check database indexes
- Review complex queries
- Consider caching

**High Latency**
- Enable CDN
- Optimize images
- Add database indexes

## Going to Production

Final checklist before going live:

- [ ] Update RLS policies for security
- [ ] Add authentication system
- [ ] Implement rate limiting
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all API endpoints
- [ ] Load test evaluation engine
- [ ] Set up error tracking
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Create runbook for incidents
- [ ] Train team on system operation

## Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Hardhat Deployment](https://hardhat.org/tutorial/deploying-to-a-live-network)
- [Base Network Docs](https://docs.base.org/)
