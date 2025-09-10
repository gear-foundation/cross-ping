// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMessageHandler {
    function handleMessage(bytes32 source, bytes calldata payload) external;
}

contract PingReceiver is IMessageHandler {
    event PongEmitted(bytes32 sender);

    function handleMessage(bytes32 sender, bytes calldata) external override {
        emit PongEmitted(sender);
    }
}