# TraceFlow Frontend - Quick Start (5 Minutes)

## Files Ready to Use
✅ All components are production-ready
✅ All utilities configured
✅ All dependencies listed
✅ Ready to deploy

---

## 3-Step Setup

### Step 1: Install Dependencies
```bash
cd traceflow-frontend
npm install
```

### Step 2: Configure Contract Address
Edit `.env.local`:
```
VITE_CONTRACT_ADDRESS=0x[YOUR_CONTRACT_ADDRESS]
```

### Step 3: Start App
```bash
npm run dev
```
→ Opens at `http://localhost:3000`

---

## File Checklist

### Root Files
- ✅ `package.json` - Dependencies
- ✅ `vite.config.js` - Build config
- ✅ `tailwind.config.js` - Styling
- ✅ `postcss.config.js` - CSS processing
- ✅ `index.html` - Entry point
- ✅ `.env.local` - Environment variables
- ✅ `.gitignore` - Git ignore rules

### src/components/
- ✅ `Navbar.jsx` - Top navigation
- ✅ `ConnectWallet.jsx` - Wallet connection
- ✅ `CreateBatch.jsx` - Create batch form
- ✅ `LogCheckpoint.jsx` - Log checkpoint form
- ✅ `VerifyBatch.jsx` - Verify batch form
- ✅ `BatchList.jsx` - List all batches
- ✅ `JourneyTimeline.jsx` - Show journey
- ✅ `Loading.jsx` - Loading spinner

### src/utils/
- ✅ `web3.js` - Ethers.js integration
- ✅ `constants.js` - Constants & configs
- ✅ `contractABI.json` - Smart contract ABI

### src/
- ✅ `App.jsx` - Main app component
- ✅ `App.css` - App styles
- ✅ `main.jsx` - React entry point
- ✅ `index.css` - Global styles

---

## How It Works

1. **Connect Wallet** → User connects MetaMask
2. **Create Batch** → Manufacturer creates batch
3. **Log Checkpoint** → Transporter logs location & temp
4. **View Journey** → Consumer sees complete timeline
5. **Verify Batch** → Consumer verifies authenticity

---

## Key Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Contract Functions Called

| Component | Function |
|-----------|----------|
| CreateBatch | `createBatch()` |
| LogCheckpoint | `logCheckpoint()` |
| VerifyBatch | `verifyBatch()` |
| BatchList | `getAllBatches()`, `getBatchInfo()` |
| JourneyTimeline | `getCheckpoints()`, `getStats()` |

---

## Network Setup

**Required**: Sepolia Testnet
**Chain ID**: 11155111
**Status**: Auto-detected via web3.js

---

## Required Credentials

1. **Contract Address** → From Remix deployment
2. **MetaMask Wallet** → Browser extension
3. **Sepolia ETH** → For gas fees (free faucet available)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "MetaMask not installed" | Install MetaMask extension |
| "Batch not found" | Check batch ID spelling |
| "Wrong network" | Switch to Sepolia in MetaMask |
| "Transaction failed" | Ensure sufficient gas/balance |

---

## Done! 🎉

Your TraceFlow frontend is ready to use.

**Next**: Deploy contract → Update `.env.local` → Run app → Connect wallet

---

**Need Help?** Check `SETUP_GUIDE.md` for detailed instructions.