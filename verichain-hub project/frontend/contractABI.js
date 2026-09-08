// VeriChainHub Contract ABI (Application Binary Interface)
const VERI_CHAIN_ABI = [
  "function owner() view returns (address)",
  "function credentialCount() view returns (uint256)",
  "function credentials(uint256) view returns (uint256 id, string recipientName, string courseName, string institution, address recipientAddress, uint256 issueDate, bytes32 dataHash, bool isValid, uint256 votesFor, uint256 votesAgainst)",
  "function hashExists(bytes32) view returns (bool)",
  "function hasVoted(uint256, address) view returns (bool)",
  "function issueCredential(string _recipientName, string _courseName, string _institution, address _recipientAddress, bytes32 _dataHash) returns (uint256)",
  "function getCredential(uint256 _id) view returns (uint256 id, string recipientName, string courseName, string institution, address recipientAddress, uint256 issueDate, bytes32 dataHash, bool isValid, uint256 votesFor, uint256 votesAgainst)",
  "function revokeCredential(uint256 _id)",
  "function voteCredential(uint256 _id, bool _support)",
  "event CredentialIssued(uint256 indexed id, string recipientName, address indexed recipientAddress, bytes32 dataHash, uint256 timestamp)",
  "event CredentialRevoked(uint256 indexed id, uint256 timestamp)",
  "event CredentialVoted(uint256 indexed id, address indexed voter, bool support, uint256 totalVotes)"
];

// Optional: Default contract address if deployed on Sepolia / Local network
let CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
