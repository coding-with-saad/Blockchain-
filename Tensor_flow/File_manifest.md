# TraceFlow Frontend - File Manifest

Complete list of all files, their locations, and contents.

---

## Root Level Files

### 1. `package.json`
**Location**: Root directory  
**Purpose**: NPM dependencies and scripts  
**Contains**: React, ethers.js, Tailwind CSS configuration  
**File**: `01_package.json`

### 2. `vite.config.js`
**Location**: Root directory  
**Purpose**: Vite build tool configuration  
**Port**: 3000 (auto-open)  
**File**: `02_vite.config.js`

### 3. `tailwind.config.js`
**Location**: Root directory  
**Purpose**: Tailwind CSS customization  
**Colors**: Primary blue, secondary, danger, success, warning  
**File**: `03_tailwind.config.js`

### 4. `postcss.config.js`
**Location**: Root directory  
**Purpose**: PostCSS processing for Tailwind  
**File**: `04_postcss.config.js`

### 5. `index.html`
**Location**: Root directory  
**Purpose**: HTML entry point  
**Mount Point**: `<div id="root"></div>`  
**File**: `05_index.html`

### 6. `.env.local`
**Location**: Root directory  
**Purpose**: Environment variables  
**Content**:
```
VITE_CONTRACT_ADDRESS=0x...
VITE_NETWORK_ID=11155111
```
**File**: `11_.env.local`

### 7. `.gitignore`
**Location**: Root directory  
**Purpose**: Git ignore rules  
**Ignores**: node_modules, dist, .env, .idea  
**File**: `12_.gitignore`

---

## Source Files (src/)

### 8. `src/main.jsx`
**Location**: `src/main.jsx`  
**Purpose**: React app entry point  
**Renders**: App component to #root  
**File**: `06_main.jsx`

### 9. `src/index.css`
**Location**: `src/index.css`  
**Purpose**: Global styles and Tailwind directives  
**Contains**: @tailwind imports, base styles, smooth scroll  
**File**: `07_index.css`

### 10. `src/App.jsx`
**Location**: `src/App.jsx`  
**Purpose**: Main application component  
**Features**:
- Wallet connection management
- Event listeners setup
- Page layout (3-column grid)
- Message toast system
- Integration of all components
**File**: `09_App.jsx`

### 11. `src/App.css`
**Location**: `src/App.css`  
**Purpose**: App-specific styles  
**Animations**: slideIn, spin  
**Responsive**: Mobile and tablet breakpoints  
**File**: `10_App.css`

---

## Components (src/components/)

### 12. `src/components/Navbar.jsx`
**Location**: `src/components/Navbar.jsx`  
**Purpose**: Top navigation bar  
**Features**:
- Logo and title display
- Wallet connection button
- Account truncation (0x1234...5678)
- Disconnect button
- Responsive layout
**Props**: account, onConnect, onDisconnect  
**File**: `01_Navbar.jsx`

### 13. `src/components/ConnectWallet.jsx`
**Location**: `src/components/ConnectWallet.jsx`  
**Purpose**: Initial wallet connection screen  
**Features**:
- MetaMask detection
- Account request
- Web3 initialization
- Beautiful landing UI
**Props**: onConnect, onError  
**File**: `02_ConnectWallet.jsx`

### 14. `src/components/CreateBatch.jsx`
**Location**: `src/components/CreateBatch.jsx`  
**Purpose**: Batch creation form for manufacturers  
**Fields**:
- Batch ID
- Product Name
- Product Category
- Manufacturing Location
- Estimated Delivery Date
**Function Called**: `createBatch()`  
**Props**: onBatchCreated, onError  
**File**: `04_CreateBatch.jsx`

### 15. `src/components/LogCheckpoint.jsx`
**Location**: `src/components/LogCheckpoint.jsx`  
**Purpose**: Checkpoint logging form for transporters  
**Fields**:
- Batch ID
- Location
- Temperature (-50 to 60°C)
- Notes (optional)
**Validation**: Temperature range check  
**Function Called**: `logCheckpoint()`  
**Props**: onCheckpointLogged, onError  
**File**: `05_LogCheckpoint.jsx`

### 16. `src/components/VerifyBatch.jsx`
**Location**: `src/components/VerifyBatch.jsx`  
**Purpose**: Batch verification form for consumers  
**Fields**: Batch ID only  
**Success Alert**: Shows verification confirmation  
**Function Called**: `verifyBatch()`  
**Props**: onBatchVerified, onError  
**File**: `06_VerifyBatch.jsx`

### 17. `src/components/BatchList.jsx`
**Location**: `src/components/BatchList.jsx`  
**Purpose**: Display all batches with status  
**Features**:
- Fetch all batches
- Status badges (Created, In Transit, Delivered, Verified)
- Color-coded status
- Batch selection
- Refresh button
- Authentication indicator
**Functions Called**: `getAllBatches()`, `getBatchInfo()`  
**Props**: onSelectBatch, onError  
**File**: `07_BatchList.jsx`

### 18. `src/components/JourneyTimeline.jsx`
**Location**: `src/components/JourneyTimeline.jsx`  
**Purpose**: Visual timeline of batch journey  
**Features**:
- Batch info cards
- Temperature statistics (min, avg, max)
- Timeline visualization
- Color-coded temperatures
- Anomaly warnings
- Quality report
- Responsive design
**Functions Called**: `getBatchInfo()`, `getCheckpoints()`, `getStats()`  
**Props**: batchId, onError  
**File**: `08_JourneyTimeline.jsx`

### 19. `src/components/Loading.jsx`
**Location**: `src/components/Loading.jsx`  
**Purpose**: Loading spinner overlay  
**Features**:
- Full-screen overlay
- Animated spinner
- Custom message
- Z-index 50 (top layer)
**Props**: message (optional)  
**File**: `03_Loading.jsx`

---

## Utilities (src/utils/)

### 20. `src/utils/web3.js`
**Location**: `src/utils/web3.js`  
**Purpose**: Ethers.js integration and Web3 utilities  
**Functions**:
- `initWeb3()` - Initialize web3 connection
- `getProvider()` - Get ethers provider
- `getSigner()` - Get transaction signer
- `getContract()` - Get contract instance
- `switchNetwork()` - Switch blockchain network
- `getCurrentAccount()` - Get current wallet address
- `requestAccounts()` - Request wallet connection
**Dependencies**: ethers.js  
**File**: `13_web3.js`

### 21. `src/utils/constants.js`
**Location**: `src/utils/constants.js`  
**Purpose**: Global constants and configuration  
**Constants**:
- CONTRACT_ADDRESS (from .env)
- NETWORK_ID (Sepolia = 11155111)
- BATCH_STATUS enum (CREATED, IN_TRANSIT, DELIVERED, VERIFIED)
- BATCH_STATUS_LABELS (status names)
- BATCH_STATUS_COLORS (TailwindCSS classes)
- MIN_TEMP = -10°C
- MAX_TEMP = 45°C
**File**: `14_constants.js`

### 22. `src/utils/contractABI.json`
**Location**: `src/utils/contractABI.json`  
**Purpose**: Smart contract ABI (function signatures)  
**Includes**:
- `registerMfg()` - Register manufacturer
- `registerTrn()` - Register transporter
- `createBatch()` - Create batch
- `logCheckpoint()` - Log checkpoint
- `verifyBatch()` - Verify batch
- `getBatchInfo()` - Get batch details
- `getCheckpoints()` - Get all checkpoints
- `getAllBatches()` - Get all batch IDs
- `getBatchesByMfg()` - Get manufacturer batches
- `getStats()` - Get batch statistics
- Events (BatchCreated, CheckpointLogged, etc.)
**File**: `15_contractABI.json`

---

## Documentation

### 23. `SETUP_GUIDE.md`
**Purpose**: Comprehensive setup instructions  
**Covers**:
- Prerequisites
- Step-by-step setup
- Tailwind configuration
- Smart contract integration
- Environment variables
- Running the app
- Features overview
- Troubleshooting

### 24. `QUICK_START.md`
**Purpose**: Quick reference (5-minute setup)  
**Covers**:
- 3-step installation
- File checklist
- How it works
- Key commands
- Troubleshooting table

### 25. `FILE_MANIFEST.md`
**Purpose**: This document  
**Contains**: Complete file reference

---

## Summary

**Total Files**: 25
**Component Files**: 8
**Utility Files**: 3
**Configuration Files**: 7
**Documentation Files**: 3
**Total Lines of Code**: ~1500

---

## Deployment Checklist

- [ ] Copy all files to project directory
- [ ] Run `npm install`
- [ ] Update `.env.local` with contract address
- [ ] Run `npm run dev`
- [ ] Test wallet connection
- [ ] Create test batch
- [ ] Log checkpoint
- [ ] Verify batch
- [ ] Run `npm run build` (production)

---

## File Dependencies

```
index.html
  └─ src/main.jsx
      └─ src/App.jsx
          ├─ Navbar.jsx
          ├─ ConnectWallet.jsx
          ├─ CreateBatch.jsx
          ├─ LogCheckpoint.jsx
          ├─ VerifyBatch.jsx
          ├─ BatchList.jsx
          ├─ JourneyTimeline.jsx
          └─ Loading.jsx
          
All components depend on:
  ├─ src/utils/web3.js
  ├─ src/utils/constants.js
  └─ src/utils/contractABI.json
```

---

## Key Integrations

1. **Ethers.js** - Web3 blockchain interaction
2. **Tailwind CSS** - Styling and responsive design
3. **React** - UI components and state management
4. **Vite** - Build tool and dev server
5. **MetaMask** - Wallet connection (window.ethereum)

---

**Last Updated**: 2024  
**Version**: 1.0  
**Status**: Production Ready ✅