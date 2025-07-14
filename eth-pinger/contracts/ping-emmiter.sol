// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EthPinger {
    event PingFromEthereum(address indexed from);

    function ping() external {
        emit PingFromEthereum(msg.sender);
    }
}