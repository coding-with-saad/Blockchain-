// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BasicSmartContract
 * @dev A comprehensive yet simple Task Management smart contract designed for educational purposes.
 * It demonstrates state variables, structs, mappings, arrays, modifiers, custom errors, events,
 * and various function visibilities/mutability states.
 */
contract BasicSmartContract {
    
    // ==========================================
    // 1. STRUCTS & ENUMS
    // ==========================================

    // A struct defines a custom data type grouping several variables
    struct Task {
        uint256 id;             // Unique identifier for the task
        string title;           // Title of the task
        string description;     // Detailed description of the task
        bool isCompleted;       // Completion status
        address assignedTo;     // Address of the user assigned to this task
    }

    // ==========================================
    // 2. STATE VARIABLES
    // ==========================================
    // State variables are permanently stored in the contract's storage on-chain

    // Public state variable: anyone can read this, and Solidity auto-generates a getter function
    address public owner;

    // Private state variable: only accessible within this contract
    uint256 private totalTasksCreated;

    // Mappings: key-value store mapping task IDs to Task structs
    mapping(uint256 => Task) private idToTask;

    // Mappings: tracks how many tasks are completed by a specific user address
    mapping(address => uint256) public userCompletedCount;

    // Array: stores a list of all task IDs created so far
    uint256[] public taskIds;

    // Constant: values that cannot change, evaluated at compile-time (saves gas)
    uint256 public constant CREATION_FEE = 0.001 ether;

    // ==========================================
    // 3. CUSTOM ERRORS
    // ==========================================
    // Custom errors are gas-efficient alternatives to revert strings
    error OnlyOwnerAllowed();
    error TaskDoesNotExist(uint256 taskId);
    error TaskAlreadyCompleted(uint256 taskId);
    error InvalidInputString();
    error IncorrectFeePaid(uint256 paid, uint256 required);
    error TransferFailed();

    // ==========================================
    // 4. EVENTS
    // ==========================================
    // Events allow clients (like Web3 frontends) to listen for specific activities on the blockchain
    event TaskCreated(uint256 indexed taskId, string title, address indexed assignedTo);
    event TaskCompleted(uint256 indexed taskId, address indexed completedBy);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    // ==========================================
    // 5. MODIFIERS
    // ==========================================
    // Modifiers are reusable chunks of code that check conditions before running a function

    /// @dev Restricts execution to only the contract owner
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert OnlyOwnerAllowed();
        }
        _; // The "_" is a merge wildcard indicating where the original function code runs
    }

    /// @dev Validates if the specified task ID exists in our record
    modifier taskExists(uint256 _taskId) {
        if (_taskId == 0 || _taskId > totalTasksCreated) {
            revert TaskDoesNotExist(_taskId);
        }
        _;
    }

    // ==========================================
    // 6. CONSTRUCTOR
    // ==========================================
    // Runs exactly once when the contract is deployed to initialize state
    constructor() {
        owner = msg.sender; // Set the deployer of the contract as the owner
        totalTasksCreated = 0;
    }

    // ==========================================
    // 7. EXTERNAL FUNCTIONS (STATE-CHANGING)
    // ==========================================
    // external: can only be called from outside the contract (saves gas for passing large parameters)

    /**
     * @notice Creates a new task. Requires a registration fee of 0.001 ether.
     * @param _title Title of the task.
     * @param _description Description of the task.
     * @param _assignee Address of the user to assign this task to.
     */
    function createTask(
        string calldata _title,
        string calldata _description,
        address _assignee
    ) external payable {
        // 1. Validation (Requires specific fee, and non-empty inputs)
        if (msg.value != CREATION_FEE) {
            revert IncorrectFeePaid(msg.value, CREATION_FEE);
        }
        if (bytes(_title).length == 0 || bytes(_description).length == 0) {
            revert InvalidInputString();
        }
        if (_assignee == address(0)) {
            revert InvalidInputString();
        }

        // Increment total tasks count (serves as the new task ID)
        totalTasksCreated++;
        uint256 newTaskId = totalTasksCreated;

        // 2. Storage updates
        // Instantiating a new Task struct and storing it inside our private mapping
        idToTask[newTaskId] = Task({
            id: newTaskId,
            title: _title,
            description: _description,
            isCompleted: false,
            assignedTo: _assignee
        });

        // Pushing the new ID to the taskIds array
        taskIds.push(newTaskId);

        // 3. Emit event to log this activity
        emit TaskCreated(newTaskId, _title, _assignee);
    }

    /**
     * @notice Completes a task. Only the assigned user can complete their task.
     * @param _taskId The ID of the task to mark as completed.
     */
    function completeTask(uint256 _taskId) external taskExists(_taskId) {
        // Retrieve the task pointer from storage to modify it
        Task storage task = idToTask[_taskId];

        // Access control: Check if caller is the assigned user
        if (msg.sender != task.assignedTo) {
            revert OnlyOwnerAllowed(); // Reused error for unauthorized access
        }

        // Verify that the task is not already completed
        if (task.isCompleted) {
            revert TaskAlreadyCompleted(_taskId);
        }

        // Modify the state
        task.isCompleted = true;
        userCompletedCount[msg.sender]++;

        // Emit completion event
        emit TaskCompleted(_taskId, msg.sender);
    }

    /**
     * @notice Allows the owner to withdraw collected creation fees from the contract.
     */
    function withdrawFees() external onlyOwner {
        uint256 contractBalance = address(this).balance;
        if (contractBalance == 0) {
            revert IncorrectFeePaid(0, 1); // Helper validation
        }

        // Send all contract funds to the owner
        (bool success, ) = payable(owner).call{value: contractBalance}("");
        if (!success) {
            revert TransferFailed();
        }

        emit FundsWithdrawn(owner, contractBalance);
    }

    // ==========================================
    // 8. VIEW & PURE FUNCTIONS
    // ==========================================
    
    /**
     * @notice Returns details of a specific task.
     * @dev view: Reads from block/contract state but does not modify it.
     * @param _taskId The ID of the task to retrieve.
     * @return The Task struct from storage.
     */
    function getTaskDetails(uint256 _taskId) 
        external 
        view 
        taskExists(_taskId) 
        returns (Task memory) 
    {
        // returns a copy of the task from storage to memory
        return idToTask[_taskId];
    }

    /**
     * @notice Returns the total count of tasks created.
     * @dev public visibility allows internal and external access.
     */
    function getTaskCount() public view returns (uint256) {
        return totalTasksCreated;
    }

    /**
     * @notice Evaluates task urgency score based on a multiplier calculation.
     * @dev pure: Does not read or modify blockchain state.
     * @param _daysRemaining Number of days remaining for the deadline.
     * @return urgencyScore Calculated priority score.
     */
    function calculateUrgencyScore(uint256 _daysRemaining) 
        public 
        pure 
        returns (uint256 urgencyScore) 
    {
        if (_daysRemaining == 0) {
            return 100; // Max urgency
        }
        // Basic calculation relying purely on parameters passed
        urgencyScore = 100 / _daysRemaining;
    }

    // ==========================================
    // 9. INTERNAL & PRIVATE HELPERS
    // ==========================================

    /**
     * @dev An internal helper function.
     * Can only be called by this contract or contracts inheriting from it.
     */
    function internalHelper() internal pure returns (string memory) {
        return "Internal execution successful";
    }

    /**
     * @dev A private helper function.
     * Can only be called from inside this contract, not by inheriting contracts.
     */
    function _privateHelper() private pure returns (string memory) {
        return "Private execution successful";
    }
}
