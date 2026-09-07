// VeriChain Hub - Frontend Application Logic
// Uses Ethers.js v6 with Dual Mode: Live Web3 (MetaMask) + Interactive Demo Simulation

let provider = null;
let signer = null;
let contract = null;
let currentAccount = null;
let demoMode = true; // Enabled by default for seamless instant presentations

// In-Memory Simulated Blockchain Storage for Demo Mode
let mockDatabase = [
  {
    id: 1,
    recipientName: "Alice Nakamoto",
    courseName: "Master of Blockchain Architecture & Security",
    institution: "Department of Computer Science & Cryptography",
    recipientAddress: "0x71C839129035B74D145620980005C82715F4752B",
    issueDate: Math.floor(Date.now() / 1000) - 86400 * 5, // 5 days ago
    dataHash: "0x8a91b4c3e2f1d0a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
    isValid: true,
    votesFor: 18,
    votesAgainst: 1
  },
  {
    id: 2,
    recipientName: "Bob Finney",
    courseName: "Smart Contract Engineering & DeFi Protocols",
    institution: "Web3 Institute of Technology",
    recipientAddress: "0x2546BcD3b6E2b0A47167664790079C3dD64140A8",
    issueDate: Math.floor(Date.now() / 1000) - 86400 * 2, // 2 days ago
    dataHash: "0x4b7c2d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c",
    isValid: true,
    votesFor: 12,
    votesAgainst: 0
  },
  {
    id: 3,
    recipientName: "Charlie Buterin",
    courseName: "Zero-Knowledge Cryptography & Rollups",
    institution: "Autonomous School of Ethereum",
    recipientAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    issueDate: Math.floor(Date.now() / 1000) - 3600 * 4, // 4 hours ago
    dataHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    isValid: true,
    votesFor: 7,
    votesAgainst: 0
  }
];

let currentBlock = 582910;

// Initialize when page loads
window.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupLiveHashCalculator();
  setupModeToggle();
  setupRemixModal();
  setupWalletConnect();
  setupIssueForm();
  setupFetch();
  setupDAO();
  populateExplorerInitialLogs();
  renderDAOList();
  updateStats();

  // Load first credential into view
  fetchAndDisplayCredential(1);
});

// -------------------------------------------------------------
// 1. TAB SWITCHING LOGIC
// -------------------------------------------------------------
function setupTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.tab;

      // Reset tabs styling
      tabs.forEach(t => {
        t.className = "tab-btn px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 transition bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white";
      });

      // Active tab styling
      tab.className = "tab-btn px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 transition bg-indigo-600 text-white shadow-lg shadow-indigo-600/20";

      // Hide all contents & display target
      contents.forEach(content => {
        if (content.id === targetId) {
          content.classList.remove("hidden");
          content.classList.add("block");
        } else {
          content.classList.add("hidden");
          content.classList.remove("block");
        }
      });
    });
  });
}

// -------------------------------------------------------------
// 2. LIVE KECCAK-256 HASH CALCULATOR (Demonstrates Cryptography)
// -------------------------------------------------------------
function setupLiveHashCalculator() {
  const nameInp = document.getElementById("recipientName");
  const courseInp = document.getElementById("courseName");
  const instInp = document.getElementById("institution");
  const addrInp = document.getElementById("recipientAddress");
  const hashDisplay = document.getElementById("previewHash");
  const useMyAddrBtn = document.getElementById("useMyAddressBtn");

  function calculateHash() {
    const rawData = `${nameInp.value.trim()}|${courseInp.value.trim()}|${instInp.value.trim()}|${addrInp.value.trim()}`;
    if (rawData === "|||") {
      hashDisplay.textContent = "0x0000000000000000000000000000000000000000000000000000000000000000";
      return;
    }

    try {
      if (window.ethers && ethers.keccak256 && ethers.toUtf8Bytes) {
        const hash = ethers.keccak256(ethers.toUtf8Bytes(rawData));
        hashDisplay.textContent = hash;
      } else {
        // Simple fallback pseudo-hash if ethers not loaded
        let simpleHash = "0x" + Array.from(rawData).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0).toString(16).padStart(64, 'a');
        hashDisplay.textContent = simpleHash;
      }
    } catch (err) {
      console.error(err);
    }
  }

  [nameInp, courseInp, instInp, addrInp].forEach(input => {
    input.addEventListener("input", calculateHash);
  });

  useMyAddrBtn.addEventListener("click", () => {
    if (currentAccount) {
      addrInp.value = currentAccount;
      calculateHash();
    } else {
      addrInp.value = "0x71C839129035B74D145620980005C82715F4752B";
      calculateHash();
    }
  });
}

// -------------------------------------------------------------
// 3. MODE TOGGLE (Demo Simulation vs Live Web3)
// -------------------------------------------------------------
function setupModeToggle() {
  const toggleBtn = document.getElementById("modeToggleBtn");
  const modeText = document.getElementById("modeText");

  toggleBtn.addEventListener("click", () => {
    demoMode = !demoMode;
    if (demoMode) {
      toggleBtn.className = "text-xs px-3 py-2 rounded-lg border border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50 transition flex items-center gap-1.5";
      modeText.textContent = "Demo Mode: ON";
      addExplorerLog("MODE_CHANGE", currentBlock, "Demo Simulation Mode Activated");
    } else {
      toggleBtn.className = "text-xs px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 transition flex items-center gap-1.5";
      modeText.textContent = "Live Web3: ON";
      addExplorerLog("MODE_CHANGE", currentBlock, "Live Web3 MetaMask Mode Activated");
      if (!currentAccount) {
        connectWallet();
      }
    }
  });
}

// -------------------------------------------------------------
// 4. METAMASK WALLET CONNECTION
// -------------------------------------------------------------
function setupWalletConnect() {
  const btn = document.getElementById("connectWalletBtn");
  btn.addEventListener("click", connectWallet);
}

async function connectWallet() {
  const btn = document.getElementById("connectWalletBtn");
  const btnText = document.getElementById("walletBtnText");
  const networkBadge = document.getElementById("networkBadge");

  if (window.ethereum) {
    try {
      btnText.textContent = "Connecting...";
      provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      signer = await provider.getSigner();
      currentAccount = accounts[0];

      // Fetch Network
      const network = await provider.getNetwork();
      networkBadge.textContent = `${network.name || "EVM Chain"} (Chain ID: ${network.chainId})`;

      // Contract Instance
      if (typeof VERI_CHAIN_ABI !== "undefined" && typeof CONTRACT_ADDRESS !== "undefined") {
        contract = new ethers.Contract(CONTRACT_ADDRESS, VERI_CHAIN_ABI, signer);
      }

      btnText.textContent = `${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`;
      btn.className = "px-4 py-2.5 rounded-xl bg-emerald-700/80 border border-emerald-500 text-white font-semibold text-sm shadow-lg flex items-center gap-2";

      addExplorerLog("WALLET_CONNECT", currentBlock, `Connected: ${currentAccount}`);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      btnText.textContent = "Connect Wallet";
      alert("Could not connect MetaMask. Running in Demo Simulation Mode.");
    }
  } else {
    // If user has no MetaMask extension installed
    currentAccount = "0x71C839129035B74D145620980005C82715F4752B";
    btnText.textContent = "0x71C8...752B (Simulated)";
    btn.className = "px-4 py-2.5 rounded-xl bg-indigo-700/80 border border-indigo-500 text-white font-semibold text-sm shadow-lg flex items-center gap-2";
    addExplorerLog("WALLET_SIM", currentBlock, "MetaMask not detected: Using Simulated Account");
  }
}

// -------------------------------------------------------------
// 5. ISSUE CREDENTIAL (WRITE TO BLOCKCHAIN)
// -------------------------------------------------------------
function setupIssueForm() {
  const form = document.getElementById("issueForm");
  const submitBtn = document.getElementById("submitIssueBtn");
  const successCard = document.getElementById("issueSuccessCard");
  const idDisplay = document.getElementById("issuedIdDisplay");
  const txDisplay = document.getElementById("issuedTxDisplay");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("recipientName").value.trim();
    const course = document.getElementById("courseName").value.trim();
    const inst = document.getElementById("institution").value.trim();
    const addr = document.getElementById("recipientAddress").value.trim();
    const hash = document.getElementById("previewHash").textContent.trim();

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mining Block & Executing Smart Contract...`;

    try {
      let newId;
      let txHash;

      if (!demoMode && contract) {
        // Real Web3 execution
        const tx = await contract.issueCredential(name, course, inst, addr, hash);
        const receipt = await tx.wait();
        txHash = receipt.hash;
        newId = mockDatabase.length + 1; // Or read from event
      } else {
        // Simulation execution with realistic delay
        await new Promise(r => setTimeout(r, 1200));
        currentBlock += 1;
        newId = mockDatabase.length + 1;
        txHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");

        // Store into mock database
        mockDatabase.push({
          id: newId,
          recipientName: name,
          courseName: course,
          institution: inst,
          recipientAddress: addr,
          issueDate: Math.floor(Date.now() / 1000),
          dataHash: hash,
          isValid: true,
          votesFor: 1,
          votesAgainst: 0
        });
      }

      // Update block indicator
      document.getElementById("blockNumber").textContent = currentBlock;

      // Log event
      addExplorerLog("CredentialIssued", currentBlock, `ID: #${newId} | Recipient: ${name} | Hash: ${hash.substring(0, 14)}...`, txHash);

      // Display success output
      idDisplay.textContent = `#${newId}`;
      txDisplay.textContent = txHash;
      successCard.classList.remove("hidden");

      // Update global stats
      updateStats();
      renderDAOList();

      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-cube"></i> Write & Store on Blockchain`;

      // Automatically fill search box and load the new certificate
      document.getElementById("searchIdInput").value = newId;
      fetchAndDisplayCredential(newId);

    } catch (err) {
      console.error(err);
      alert("Transaction failed: " + (err.reason || err.message));
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-cube"></i> Write & Store on Blockchain`;
    }
  });
}

// -------------------------------------------------------------
// 6. FETCH & AUDIT CREDENTIAL (READ FROM BLOCKCHAIN)
// -------------------------------------------------------------
function setupFetch() {
  const fetchBtn = document.getElementById("fetchBtn");
  const searchInp = document.getElementById("searchIdInput");
  const revokeBtn = document.getElementById("revokeBtn");

  fetchBtn.addEventListener("click", () => {
    const id = parseInt(searchInp.value);
    if (isNaN(id) || id <= 0) {
      alert("Please enter a valid numeric Credential ID");
      return;
    }
    fetchAndDisplayCredential(id);
  });

  revokeBtn.addEventListener("click", () => {
    const id = parseInt(document.getElementById("certId").textContent.replace("#", ""));
    const target = mockDatabase.find(c => c.id === id);
    if (target) {
      target.isValid = false;
      fetchAndDisplayCredential(id);
      addExplorerLog("CredentialRevoked", currentBlock, `ID: #${id} marked as REVOKED by contract owner`);
      alert(`Credential #${id} has been revoked on the blockchain.`);
    }
  });
}

async function fetchAndDisplayCredential(id) {
  let item = null;

  if (!demoMode && contract) {
    try {
      const data = await contract.getCredential(id);
      item = {
        id: Number(data.id),
        recipientName: data.recipientName,
        courseName: data.courseName,
        institution: data.institution,
        recipientAddress: data.recipientAddress,
        issueDate: Number(data.issueDate),
        dataHash: data.dataHash,
        isValid: data.isValid,
        votesFor: Number(data.votesFor),
        votesAgainst: Number(data.votesAgainst)
      };
    } catch (err) {
      console.error("On-chain fetch error:", err);
    }
  }

  // Fallback to local memory if demo mode or not found
  if (!item) {
    item = mockDatabase.find(c => c.id === id);
  }

  if (!item) {
    alert(`Credential #${id} does not exist on the blockchain.`);
    return;
  }

  // Update UI Elements
  document.getElementById("certId").textContent = `#${String(item.id).padStart(3, '0')}`;
  document.getElementById("certRecipient").textContent = item.recipientName;
  document.getElementById("certCourse").textContent = item.courseName;
  document.getElementById("certInstitution").textContent = item.institution;
  document.getElementById("certAddress").textContent = item.recipientAddress;
  document.getElementById("certHash").textContent = item.dataHash;
  document.getElementById("certVotes").textContent = `👍 ${item.votesFor} Endorsements | 👎 ${item.votesAgainst}`;

  const dateObj = new Date(item.issueDate * 1000);
  document.getElementById("certTimestamp").textContent = dateObj.toISOString().replace("T", " ").substring(0, 19) + " UTC";

  const badge = document.getElementById("certBadge");
  if (item.isValid) {
    badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span> VERIFIED IMMUTABLE RECORD`;
  } else {
    badge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30";
    badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500"></span> REVOKED / INVALID RECORD`;
  }

  addExplorerLog("getCredential(read)", currentBlock, `Fetched Record ID #${item.id} (${item.recipientName})`);
}

// -------------------------------------------------------------
// 7. COMMUNITY DAO AUDIT & VOTING
// -------------------------------------------------------------
function setupDAO() {
  // Event delegation for vote buttons
  const list = document.getElementById("daoList");
  list.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-vote]");
    if (!btn) return;

    const id = parseInt(btn.dataset.id);
    const type = btn.dataset.vote; // "up" or "down"
    const target = mockDatabase.find(c => c.id === id);

    if (target) {
      if (type === "up") {
        target.votesFor += 1;
        addExplorerLog("CredentialVoted", currentBlock, `Voted YES on #${id} (Total: ${target.votesFor})`);
      } else {
        target.votesAgainst += 1;
        addExplorerLog("CredentialVoted", currentBlock, `Voted NO on #${id} (Total: ${target.votesAgainst})`);
      }
      renderDAOList();
      if (document.getElementById("certId").textContent === `#${String(id).padStart(3, '0')}`) {
        document.getElementById("certVotes").textContent = `👍 ${target.votesFor} Endorsements | 👎 ${target.votesAgainst}`;
      }
    }
  });
}

function renderDAOList() {
  const container = document.getElementById("daoList");
  container.innerHTML = "";

  mockDatabase.forEach(item => {
    const card = document.createElement("div");
    card.className = "p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4";
    card.innerHTML = `
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="font-mono text-xs text-indigo-400 font-bold">#${String(item.id).padStart(3, '0')}</span>
          <strong class="text-sm text-white">${item.recipientName}</strong>
          <span class="text-xs text-slate-400 font-normal">(${item.institution})</span>
        </div>
        <p class="text-xs text-slate-300">${item.courseName}</p>
        <p class="text-[11px] font-mono text-purple-300 mt-1 truncate max-w-md">${item.dataHash}</p>
      </div>
      <div class="flex items-center gap-2">
        <button data-vote="up" data-id="${item.id}" class="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 transition text-xs flex items-center gap-1.5">
          <i class="fa-solid fa-thumbs-up"></i> ${item.votesFor}
        </button>
        <button data-vote="down" data-id="${item.id}" class="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60 transition text-xs flex items-center gap-1.5">
          <i class="fa-solid fa-thumbs-down"></i> ${item.votesAgainst}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// -------------------------------------------------------------
// 8. LIVE BLOCK EXPLORER LOGS
// -------------------------------------------------------------
function addExplorerLog(eventName, block, payload, customTx = null) {
  const tbody = document.getElementById("explorerTableBody");
  const row = document.createElement("tr");
  row.className = "border-b border-slate-800/40 hover:bg-slate-900/40 transition";

  const tx = customTx || ("0x" + Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join("") + "...");
  const now = new Date().toTimeString().split(" ")[0];

  row.innerHTML = `
    <td class="py-2.5 px-4 font-bold text-indigo-400">${eventName}</td>
    <td class="py-2.5 px-4 text-slate-300">#${block}</td>
    <td class="py-2.5 px-4 text-emerald-400 truncate max-w-[120px]">${tx}</td>
    <td class="py-2.5 px-4 text-slate-300">${payload}</td>
    <td class="py-2.5 px-4 text-slate-500">${now}</td>
  `;

  tbody.insertBefore(row, tbody.firstChild);

  // Keep max 15 rows
  if (tbody.children.length > 15) {
    tbody.removeChild(tbody.lastChild);
  }
}

function populateExplorerInitialLogs() {
  addExplorerLog("GenesisBlock", 582900, "VeriChain Hub Contract Initialized", "0x3f4a...9821");
  addExplorerLog("CredentialIssued", 582905, "ID: #1 | Alice Nakamoto", "0x7a1b...4c2d");
  addExplorerLog("CredentialIssued", 582907, "ID: #2 | Bob Finney", "0x2e8f...6a1b");
  addExplorerLog("CredentialIssued", 582909, "ID: #3 | Charlie Buterin", "0x9c4d...1e8f");
}

function updateStats() {
  document.getElementById("statTotalCreds").textContent = mockDatabase.length;
}

// -------------------------------------------------------------
// 9. REMIX IDE HELPER & CONFIG
// -------------------------------------------------------------
function setupRemixModal() {
  const modal = document.getElementById("remixModal");
  const openBtn = document.getElementById("remixHelpBtn");
  const closeBtn = document.getElementById("closeRemixModal");
  const copyBtn = document.getElementById("copyContractCodeBtn");
  const copyMsg = document.getElementById("copySuccessMsg");
  const saveBtn = document.getElementById("saveAddressBtn");
  const addrInp = document.getElementById("deployedAddressInput");

  // Load saved address from localStorage if present
  const savedAddr = localStorage.getItem("VERICHAIN_CONTRACT_ADDRESS");
  if (savedAddr) {
    CONTRACT_ADDRESS = savedAddr;
    addrInp.value = savedAddr;
  }

  openBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  // Copy Solidity Code with 1 click
  copyBtn.addEventListener("click", async () => {
    const solidityCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VeriChainHub {
    address public owner;
    uint256 public credentialCount;

    struct Credential {
        uint256 id;
        string recipientName;
        string courseName;
        string institution;
        address recipientAddress;
        uint256 issueDate;
        bytes32 dataHash;
        bool isValid;
        uint256 votesFor;
        uint256 votesAgainst;
    }

    mapping(uint256 => Credential) public credentials;
    mapping(bytes32 => bool) public hashExists;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event CredentialIssued(uint256 indexed id, string recipientName, address indexed recipientAddress, bytes32 dataHash, uint256 timestamp);
    event CredentialRevoked(uint256 indexed id, uint256 timestamp);
    event CredentialVoted(uint256 indexed id, address indexed voter, bool support, uint256 totalVotes);

    modifier onlyOwner() {
        require(msg.sender == owner, "Error: Only contract owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCredential(
        string memory _recipientName,
        string memory _courseName,
        string memory _institution,
        address _recipientAddress,
        bytes32 _dataHash
    ) external returns (uint256) {
        require(bytes(_recipientName).length > 0, "Recipient name cannot be empty");
        require(bytes(_courseName).length > 0, "Course name cannot be empty");
        require(_recipientAddress != address(0), "Invalid recipient address");
        require(!hashExists[_dataHash], "Error: This credential hash already exists on-chain!");

        credentialCount++;
        uint256 newId = credentialCount;

        credentials[newId] = Credential({
            id: newId,
            recipientName: _recipientName,
            courseName: _courseName,
            institution: _institution,
            recipientAddress: _recipientAddress,
            issueDate: block.timestamp,
            dataHash: _dataHash,
            isValid: true,
            votesFor: 0,
            votesAgainst: 0
        });

        hashExists[_dataHash] = true;

        emit CredentialIssued(newId, _recipientName, _recipientAddress, _dataHash, block.timestamp);
        return newId;
    }

    function getCredential(uint256 _id) external view returns (
        uint256 id,
        string memory recipientName,
        string memory courseName,
        string memory institution,
        address recipientAddress,
        uint256 issueDate,
        bytes32 dataHash,
        bool isValid,
        uint256 votesFor,
        uint256 votesAgainst
    ) {
        require(_id > 0 && _id <= credentialCount, "Credential does not exist");
        Credential memory c = credentials[_id];
        return (
            c.id,
            c.recipientName,
            c.courseName,
            c.institution,
            c.recipientAddress,
            c.issueDate,
            c.dataHash,
            c.isValid,
            c.votesFor,
            c.votesAgainst
        );
    }

    function revokeCredential(uint256 _id) external onlyOwner {
        require(_id > 0 && _id <= credentialCount, "Credential does not exist");
        require(credentials[_id].isValid, "Credential is already revoked");
        credentials[_id].isValid = false;
        emit CredentialRevoked(_id, block.timestamp);
    }

    function voteCredential(uint256 _id, bool _support) external {
        require(_id > 0 && _id <= credentialCount, "Credential does not exist");
        require(!hasVoted[_id][msg.sender], "You have already voted on this credential");

        hasVoted[_id][msg.sender] = true;
        if (_support) {
            credentials[_id].votesFor++;
            emit CredentialVoted(_id, msg.sender, true, credentials[_id].votesFor);
        } else {
            credentials[_id].votesAgainst++;
            emit CredentialVoted(_id, msg.sender, false, credentials[_id].votesAgainst);
        }
    }
}`;

    try {
      await navigator.clipboard.writeText(solidityCode);
      copyMsg.classList.remove("hidden");
      setTimeout(() => copyMsg.classList.add("hidden"), 3000);
    } catch (err) {
      console.error("Copy failed:", err);
      prompt("Copy contract code manually:", solidityCode);
    }
  });

  // Save Deployed Contract Address
  saveBtn.addEventListener("click", () => {
    const val = addrInp.value.trim();
    if (val.startsWith("0x") && val.length === 42) {
      CONTRACT_ADDRESS = val;
      localStorage.setItem("VERICHAIN_CONTRACT_ADDRESS", val);
      alert(`Contract address updated to: ${val}`);
      modal.classList.add("hidden");
      addExplorerLog("CONFIG", currentBlock, `Contract Address updated: ${val.substring(0, 10)}...`);
    } else {
      alert("Please enter a valid 42-character Ethereum contract address starting with 0x");
    }
  });
}

