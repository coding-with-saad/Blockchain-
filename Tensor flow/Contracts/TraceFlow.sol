// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TraceFlow {

    // ============================================================
    // ENUMS
    // ============================================================

    enum BatchStatus {
        CREATED,
        IN_TRANSIT,
        DELIVERED,
        VERIFIED
    }

    // ============================================================
    // CONSTANTS
    // ============================================================

    int256 public constant MIN_TEMP = -10;
    int256 public constant MAX_TEMP = 45;

    // ============================================================
    // STRUCTS
    // ============================================================

    struct Checkpoint {
        string location;
        uint256 timestamp;
        int256 temperature;
        address loggedBy;
        string notes;
        bool tempAlert;
    }

    struct Batch {
        string batchId;
        string productName;
        string productCategory;
        address manufacturer;
        uint256 createdAt;
        string manufacturingLocation;
        BatchStatus status;
        uint256 estimatedDeliveryDate;

        uint256 checkpointCount;
        bool hasAnomalies;

        int256 avgTemp;
        int256 minTemp;
        int256 maxTemp;

        uint256 verificationCount;
        bool isAuthentic;

        Checkpoint[] journey;
    }

    struct Actor {
        string companyName;
        bool isActive;
        uint256 count;
        uint256 joinedDate;
    }

    // ============================================================
    // STATE VARIABLES
    // ============================================================

    address public owner;

    // IMPORTANT:
    // Private mapping avoids the huge automatic getter generated
    // by "public batches".
    mapping(string => Batch) private batches;

    string[] private batchIds;

    mapping(address => Actor) public manufacturers;
    mapping(address => Actor) public transporters;

    mapping(address => string[]) private mfgBatches;
    mapping(address => string[]) private trnBatches;
    mapping(address => string[]) private verifications;

    address[] private mfgList;
    address[] private trnList;

    // ============================================================
    // EVENTS
    // ============================================================

    event ActorRegistered(
        address indexed actor,
        string companyName,
        string actorType
    );

    event BatchCreated(
        string indexed batchId,
        string productName,
        address indexed manufacturer
    );

    event CheckpointLogged(
        string indexed batchId,
        string location,
        int256 temperature,
        address indexed loggedBy
    );

    event TemperatureAlert(
        string indexed batchId,
        int256 temperature,
        string location
    );

    event BatchStatusChanged(
        string indexed batchId,
        BatchStatus newStatus
    );

    event BatchVerified(
        string indexed batchId,
        address indexed verifier
    );

    // ============================================================
    // MODIFIERS
    // ============================================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier batchExists(string memory _batchId) {
        require(
            bytes(batches[_batchId].batchId).length > 0,
            "Batch does not exist"
        );
        _;
    }

    modifier onlyMfg() {
        require(
            manufacturers[msg.sender].isActive,
            "Not an active manufacturer"
        );
        _;
    }

    modifier onlyActiveMfg() {
        require(
            manufacturers[msg.sender].isActive,
            "Manufacturer not active"
        );
        _;
    }

    modifier onlyActiveTrn() {
        require(
            transporters[msg.sender].isActive,
            "Transporter not active"
        );
        _;
    }

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    constructor() {
        owner = msg.sender;
    }

    // ============================================================
    // OWNER
    // ============================================================

    function getOwner() external view returns (address) {
        return owner;
    }

    // ============================================================
    // MANUFACTURER REGISTRATION
    // ============================================================

    function registerMfg(
        string calldata _companyName
    ) external {

        require(
            bytes(_companyName).length > 0,
            "Company name required"
        );

        Actor storage actor = manufacturers[msg.sender];

        require(
            !actor.isActive,
            "Manufacturer already registered"
        );

        actor.companyName = _companyName;
        actor.isActive = true;
        actor.count = 0;
        actor.joinedDate = block.timestamp;

        mfgList.push(msg.sender);

        emit ActorRegistered(
            msg.sender,
            _companyName,
            "MANUFACTURER"
        );
    }

    // ============================================================
    // TRANSPORTER REGISTRATION
    // ============================================================

    function registerTrn(
        string calldata _companyName
    ) external {

        require(
            bytes(_companyName).length > 0,
            "Company name required"
        );

        Actor storage actor = transporters[msg.sender];

        require(
            !actor.isActive,
            "Transporter already registered"
        );

        actor.companyName = _companyName;
        actor.isActive = true;
        actor.count = 0;
        actor.joinedDate = block.timestamp;

        trnList.push(msg.sender);

        emit ActorRegistered(
            msg.sender,
            _companyName,
            "TRANSPORTER"
        );
    }

    // ============================================================
    // CREATE BATCH
    // ============================================================

    function createBatch(
        string calldata _batchId,
        string calldata _productName,
        string calldata _productCategory,
        string calldata _manufacturingLocation,
        uint256 _estimatedDeliveryDate
    )
        external
        onlyActiveMfg
    {
        require(
            bytes(_batchId).length > 0,
            "Batch ID required"
        );

        require(
            bytes(batches[_batchId].batchId).length == 0,
            "Batch already exists"
        );

        Batch storage newBatch = batches[_batchId];

        newBatch.batchId = _batchId;
        newBatch.productName = _productName;
        newBatch.productCategory = _productCategory;
        newBatch.manufacturer = msg.sender;
        newBatch.createdAt = block.timestamp;
        newBatch.manufacturingLocation = _manufacturingLocation;
        newBatch.status = BatchStatus.CREATED;
        newBatch.estimatedDeliveryDate = _estimatedDeliveryDate;

        newBatch.checkpointCount = 0;
        newBatch.hasAnomalies = false;

        newBatch.avgTemp = 0;
        newBatch.minTemp = 0;
        newBatch.maxTemp = 0;

        newBatch.verificationCount = 0;
        newBatch.isAuthentic = false;

        batchIds.push(_batchId);
        mfgBatches[msg.sender].push(_batchId);

        manufacturers[msg.sender].count++;

        emit BatchCreated(
            _batchId,
            _productName,
            msg.sender
        );
    }

    // ============================================================
    // LOG CHECKPOINT
    // ============================================================

    function logCheckpoint(
        string calldata _batchId,
        string calldata _location,
        int256 _temperature,
        string calldata _notes
    )
        external
        batchExists(_batchId)
        onlyActiveTrn
    {
        require(
            _temperature >= -50 &&
            _temperature <= 60,
            "Temperature out of allowed range"
        );

        Batch storage batch = batches[_batchId];

        Checkpoint memory checkpoint = Checkpoint({
            location: _location,
            timestamp: block.timestamp,
            temperature: _temperature,
            loggedBy: msg.sender,
            notes: _notes,
            tempAlert: (
                _temperature < MIN_TEMP ||
                _temperature > MAX_TEMP
            )
        });

        batch.journey.push(checkpoint);

        uint256 newCount = batch.checkpointCount + 1;
        batch.checkpointCount = newCount;

        // First temperature
        if (newCount == 1) {

            batch.minTemp = _temperature;
            batch.maxTemp = _temperature;
            batch.avgTemp = _temperature;

        } else {

            if (_temperature < batch.minTemp) {
                batch.minTemp = _temperature;
            }

            if (_temperature > batch.maxTemp) {
                batch.maxTemp = _temperature;
            }

            batch.avgTemp =
                (
                    batch.avgTemp * int256(newCount - 1)
                    + _temperature
                )
                / int256(newCount);
        }

        if (checkpoint.tempAlert) {
            batch.hasAnomalies = true;

            emit TemperatureAlert(
                _batchId,
                _temperature,
                _location
            );
        }

        batch.status = BatchStatus.IN_TRANSIT;

        trnBatches[msg.sender].push(_batchId);

        emit CheckpointLogged(
            _batchId,
            _location,
            _temperature,
            msg.sender
        );

        emit BatchStatusChanged(
            _batchId,
            BatchStatus.IN_TRANSIT
        );
    }

    // ============================================================
    // MARK DELIVERED
    // ============================================================

    function markDelivered(
        string calldata _batchId
    )
        external
        batchExists(_batchId)
        onlyActiveTrn
    {
        Batch storage batch = batches[_batchId];

        batch.status = BatchStatus.DELIVERED;

        emit BatchStatusChanged(
            _batchId,
            BatchStatus.DELIVERED
        );
    }

    // ============================================================
    // VERIFY BATCH
    // ============================================================

    function verifyBatch(
        string calldata _batchId
    )
        external
        batchExists(_batchId)
        returns (bool)
    {
        Batch storage batch = batches[_batchId];

        batch.verificationCount++;

        verifications[msg.sender].push(_batchId);

        if (!batch.isAuthentic) {
            batch.isAuthentic = true;
            batch.status = BatchStatus.VERIFIED;

            emit BatchStatusChanged(
                _batchId,
                BatchStatus.VERIFIED
            );
        }

        emit BatchVerified(
            _batchId,
            msg.sender
        );

        return batch.isAuthentic;
    }

    // ============================================================
    // BATCH BASIC INFORMATION
    // ============================================================

    function getBatchBasicInfo(
        string calldata _batchId
    )
        external
        view
        batchExists(_batchId)
        returns (
            string memory batchId,
            string memory productName,
            string memory productCategory,
            address manufacturer,
            uint256 createdAt,
            string memory manufacturingLocation,
            BatchStatus status,
            uint256 estimatedDeliveryDate
        )
    {
        Batch storage batch = batches[_batchId];

        return (
            batch.batchId,
            batch.productName,
            batch.productCategory,
            batch.manufacturer,
            batch.createdAt,
            batch.manufacturingLocation,
            batch.status,
            batch.estimatedDeliveryDate
        );
    }

    // ============================================================
    // BATCH STATISTICS
    // ============================================================

    function getStats(
        string calldata _batchId
    )
        external
        view
        batchExists(_batchId)
        returns (
            uint256 checkpointCount,
            bool hasAnomalies,
            int256 avgTemp,
            int256 minTemp,
            int256 maxTemp,
            uint256 verificationCount,
            bool isAuthentic
        )
    {
        Batch storage batch = batches[_batchId];

        return (
            batch.checkpointCount,
            batch.hasAnomalies,
            batch.avgTemp,
            batch.minTemp,
            batch.maxTemp,
            batch.verificationCount,
            batch.isAuthentic
        );
    }

    // ============================================================
    // CHECKPOINT COUNT
    // ============================================================

    function getCheckpointCount(
        string calldata _batchId
    )
        external
        view
        batchExists(_batchId)
        returns (uint256)
    {
        return batches[_batchId].journey.length;
    }

    // ============================================================
    // GET SINGLE CHECKPOINT
    // ============================================================

    function getCheckpoint(
        string calldata _batchId,
        uint256 _index
    )
        external
        view
        batchExists(_batchId)
        returns (
            string memory location,
            uint256 timestamp,
            int256 temperature,
            address loggedBy,
            string memory notes,
            bool tempAlert
        )
    {
        Checkpoint storage checkpoint =
            batches[_batchId].journey[_index];

        return (
            checkpoint.location,
            checkpoint.timestamp,
            checkpoint.temperature,
            checkpoint.loggedBy,
            checkpoint.notes,
            checkpoint.tempAlert
        );
    }

    // ============================================================
    // GET ALL CHECKPOINTS
    // ============================================================

    function getCheckpoints(
        string calldata _batchId
    )
        external
        view
        batchExists(_batchId)
        returns (Checkpoint[] memory)
    {
        return batches[_batchId].journey;
    }

    // ============================================================
    // GET BATCH IDS
    // ============================================================

    function getAllBatches()
        external
        view
        returns (string[] memory)
    {
        return batchIds;
    }

    // ============================================================
    // GET TOTAL BATCHES
    // ============================================================

    function getTotalBatches()
        external
        view
        returns (uint256)
    {
        return batchIds.length;
    }

    // ============================================================
    // MANUFACTURER BATCHES
    // ============================================================

    function getBatchesByMfg(
        address _manufacturer
    )
        external
        view
        returns (string[] memory)
    {
        return mfgBatches[_manufacturer];
    }

    // ============================================================
    // TRANSPORTER BATCHES
    // ============================================================

    function getBatchesByTrn(
        address _transporter
    )
        external
        view
        returns (string[] memory)
    {
        return trnBatches[_transporter];
    }

    // ============================================================
    // CONSUMER VERIFICATIONS
    // ============================================================

    function getVerificationsByConsumer(
        address _consumer
    )
        external
        view
        returns (string[] memory)
    {
        return verifications[_consumer];
    }

    // ============================================================
    // GET MANUFACTURER LIST
    // ============================================================

    function getManufacturers()
        external
        view
        returns (address[] memory)
    {
        return mfgList;
    }

    // ============================================================
    // GET TRANSPORTER LIST
    // ============================================================

    function getTransporters()
        external
        view
        returns (address[] memory)
    {
        return trnList;
    }

    // ============================================================
    // MANUFACTURER STATUS
    // ============================================================

    function getManufacturer(
        address _manufacturer
    )
        external
        view
        returns (
            string memory companyName,
            bool isActive,
            uint256 count,
            uint256 joinedDate
        )
    {
        Actor storage actor = manufacturers[_manufacturer];

        return (
            actor.companyName,
            actor.isActive,
            actor.count,
            actor.joinedDate
        );
    }

    // ============================================================
    // TRANSPORTER STATUS
    // ============================================================

    function getTransporter(
        address _transporter
    )
        external
        view
        returns (
            string memory companyName,
            bool isActive,
            uint256 count,
            uint256 joinedDate
        )
    {
        Actor storage actor = transporters[_transporter];

        return (
            actor.companyName,
            actor.isActive,
            actor.count,
            actor.joinedDate
        );
    }

    // ============================================================
    // DEACTIVATE MANUFACTURER
    // ============================================================

    function deactivateMfg(
        address _manufacturer
    )
        external
        onlyOwner
    {
        require(
            manufacturers[_manufacturer].isActive,
            "Already inactive"
        );

        manufacturers[_manufacturer].isActive = false;
    }

    // ============================================================
    // REACTIVATE MANUFACTURER
    // ============================================================

    function reactivateMfg(
        address _manufacturer
    )
        external
        onlyOwner
    {
        require(
            !manufacturers[_manufacturer].isActive,
            "Already active"
        );

        manufacturers[_manufacturer].isActive = true;
    }

    // ============================================================
    // DEACTIVATE TRANSPORTER
    // ============================================================

    function deactivateTrn(
        address _transporter
    )
        external
        onlyOwner
    {
        require(
            transporters[_transporter].isActive,
            "Already inactive"
        );

        transporters[_transporter].isActive = false;
    }

    // ============================================================
    // REACTIVATE TRANSPORTER
    // ============================================================

    function reactivateTrn(
        address _transporter
    )
        external
        onlyOwner
    {
        require(
            !transporters[_transporter].isActive,
            "Already active"
        );

        transporters[_transporter].isActive = true;
    }
}