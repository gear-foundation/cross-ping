// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMessageHandler {
    function handleMessage(bytes32 source, bytes calldata payload) external;
}

contract CrossPing is IMessageHandler {
    event PingSent(address indexed from);
    event PingReceived(bytes32 sender);

    function sendPing() external {
        emit PingSent(msg.sender);
    }

    function handleMessage(bytes32 sender, bytes calldata) external override {
        emit PingReceived(sender);
    }
}
