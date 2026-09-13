# TraceFlow Frontend - Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet installed in browser
- Deployed TraceFlow smart contract address
- Sepolia Testnet ETH for gas fees

---

## Step 1: Create Project Directory

```bash
mkdir traceflow-frontend
cd traceflow-frontend
```

---

## Step 2: Initialize Project & Install Dependencies

```bash
npm init -y
npm install react react-dom ethers axios vite @vitejs/plugin-react tailwindcss postcss autoprefixer
```

---

## Step 3: Set Up Tailwind CSS

```bash
npx tailwindcss init -p
```

---

## Step 4: Create Project Structure

Create the following folder structure:

```
traceflow-frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ConnectWallet.jsx
│   │   ├── CreateBatch.jsx
│   │   ├── LogCheckpoint.jsx
│   │   ├── VerifyBatch.jsx
│   │   ├── BatchList.jsx
│   │   ├── JourneyTimeline.jsx
│   │   └── Loading.jsx
│   ├── utils/
│   │   ├── contractABI.json
│   │   ├── constants.js
│   │   └── web3.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   ├── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.local
└── .gitignore
```

---

## Step 5: Copy Files

Copy all the provided files into their respective locations:

- `package.json` → root
- `vite.config.js` → root
- `tailwind.config.js` → root
- `postcss.config.js` → root
- `index.html` → root
- `.env.local` → root
- `.gitignore` → root
- All component files → `src/components/`
- All utility files → `src/utils/`
- `App.jsx`, `App.css`, `main.jsx`, `index.css` → `src/`

---

## Step 6: Update Smart Contract Address

Edit `.env.local` and replace with your deployed contract address:

```
VITE_CONTRACT_ADDRESS=0xYourActualContractAddressHere
VITE_NETWORK_ID=11155111
```

To get your contract address:
1. Deploy the TraceFlow.sol contract on Remix IDE
2. Copy the contract address from the deployment section
3. Paste it in `.env.local`

---

## Step 7: Update Contract ABI (if needed)

If your contract is different, update `src/utils/contractABI.json` with the correct ABI:

1. Go to Remix IDE
2. After deploying, click on the contract
3. Copy the ABI from "ABI" button
4. Replace the ABI in `contractABI.json`

---

## Step 8: Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

---

## Step 9: Connect MetaMask

1. Open the app in browser
2. Click "Connect MetaMask"
3. Approve the connection request
4. Make sure you're on Sepolia Testnet

---

## Features Overview

### 1. **Create Batch** (Manufacturer)
- Fill in batch details
- Submit to create a new batch on blockchain
- Each batch gets unique ID

### 2. **Log Checkpoint** (Transporter)
- Enter batch ID, location, and temperature
- Each location update creates a checkpoint
- Temperature anomalies are flagged automatically

### 3. **Verify Batch** (Consumer)
- Enter batch ID to verify authenticity
- Checks all checkpoints and quality metrics
- Confirms product journey integrity

### 4. **View Journey Timeline**
- Select a batch from the list
- See complete journey with all checkpoints
- View temperature data and alerts
- Check quality summary

---

## Important Notes

### Network Requirements
- **Network**: Sepolia Testnet (ChainID: 11155111)
- **RPC**: https://sepolia.infura.io/v3/YOUR_INFURA_KEY

### Gas Fees
- Small transactions: ~0.01 - 0.05 ETH
- Get testnet ETH from: https://sepolia-faucet.pk910.de/

### Common Issues

**Issue: "MetaMask not installed"**
- Solution: Install MetaMask extension from chrome.google.com/webstore

**Issue: "Batch not found"**
- Solution: Make sure batch ID is correct and exists on blockchain

**Issue: "Temperature out of range"**
- Solution: Temperature must be between -50°C and 60°C

**Issue: "Wrong network"**
- Solution: Switch to Sepolia Testnet in MetaMask

---

## Build for Production

```bash
npm run build
```

This creates optimized production files in the `dist/` folder.

---

## Deploy to Web

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Option 3: GitHub Pages
```bash
npm run build
# Push dist folder to gh-pages branch
```

---

## Support Functions

All component functions are self-contained and handle:
- ✅ Error handling
- ✅ Loading states
- ✅ Transaction validation
- ✅ UI feedback (toasts)
- ✅ Data fetching

---

## Architecture

```
User (React Components)
    ↓
Ethers.js (Web3 Integration)
    ↓
Smart Contract (Blockchain)
    ↓
Data Response
    ↓
UI Display
```

---

## Troubleshooting

### Check Web3 Connection
Open browser console and test:
```javascript
window.ethereum.isConnected()
```

### View Transaction Details
1. Copy transaction hash from MetaMask
2. Search on https://sepolia.etherscan.io
3. See all transaction details

### Clear Cache
```bash
rm -rf node_modules dist
npm install
npm run dev
```

---

## Next Steps

1. ✅ Deploy smart contract
2. ✅ Copy contract address to `.env.local`
3. ✅ Run `npm install`
4. ✅ Run `npm run dev`
5. ✅ Connect MetaMask wallet
6. ✅ Start using the app!

---