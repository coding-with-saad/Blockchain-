// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VeriChainHub
 * @notice Decentralized Academic Credential & Asset Verification Platform
 * @dev Covers: Structs, Mappings, Events, Modifiers, Cryptographic Hashing, EIP standards & DAO Governance
 */
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

    // Mapping from ID to Credential details
    mapping(uint256 => Credential) public credentials;
    // Mapping to prevent duplicate data hashes (Integrity & Immutability)
    mapping(bytes32 => bool) public hashExists;
    // Mapping for DAO voting: credentialId => voterAddress => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Events for frontend listening via Ethers.js
    event CredentialIssued(
        uint256 indexed id,
        string recipientName,
        address indexed recipientAddress,
        bytes32 dataHash,
        uint256 timestamp
    );
    event CredentialRevoked(uint256 indexed id, uint256 timestamp);
    event CredentialVoted(uint256 indexed id, address indexed voter, bool support, uint256 totalVotes);

    modifier onlyOwner() {
        require(msg.sender == owner, "Error: Only contract owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice WRITE OPERATION: Store new credential on the blockchain
     */
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

    /**
     * @notice READ OPERATION: Fetch credential data back from the blockchain
     */
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

    /**
     * @notice WRITE OPERATION: Revoke a credential (tamper/fraud protection)
     */
    function revokeCredential(uint256 _id) external onlyOwner {
        require(_id > 0 && _id <= credentialCount, "Credential does not exist");
        require(credentials[_id].isValid, "Credential is already revoked");
        credentials[_id].isValid = false;
        emit CredentialRevoked(_id, block.timestamp);
    }

    /**
     * @notice WRITE OPERATION: Mini-DAO community governance voting
     */
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
}
