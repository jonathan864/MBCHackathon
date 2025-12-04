// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AgentSafeWallet {
    address public owner;
    address public executor;

    event ExecutorUpdated(address indexed newExecutor);
    event TransferExecuted(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyExecutor() {
        require(msg.sender == executor, "Only executor can call this");
        _;
    }

    constructor(address _owner, address _executor) {
        require(_owner != address(0), "Owner cannot be zero address");
        require(_executor != address(0), "Executor cannot be zero address");
        owner = _owner;
        executor = _executor;
    }

    function setExecutor(address _executor) external onlyOwner {
        require(_executor != address(0), "Executor cannot be zero address");
        executor = _executor;
        emit ExecutorUpdated(_executor);
    }

    function executeTransfer(address payable to, uint256 amount) external onlyExecutor {
        require(to != address(0), "Cannot transfer to zero address");
        require(address(this).balance >= amount, "Insufficient balance");

        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");

        emit TransferExecuted(to, amount);
    }

    receive() external payable {}
}
