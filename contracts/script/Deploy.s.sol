// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {GiwaGuardEscrow} from "../src/GiwaGuardEscrow.sol";

contract Deploy is Script {
    function run() external returns (GiwaGuardEscrow) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);
        GiwaGuardEscrow escrow = new GiwaGuardEscrow();
        vm.stopBroadcast();
        console.log("GiwaGuardEscrow deployed at:", address(escrow));
        return escrow;
    }
}
