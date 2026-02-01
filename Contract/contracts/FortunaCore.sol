// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./libraries/Types.sol";
import "./libraries/Errors.sol";
import "./libraries/Events.sol";
import "./IFortunaCore.sol";
import "./IFortunaManager.sol";
import "./FortunaVRF.sol";
import "./access/Admin.sol";
import "./IERC20.sol";
import "./IERC20Permit.sol";

contract FortunaCore is IFortunaCore, Admin {
    IFortunaManager public manager;
    IERC20 public usdcToken;

    uint256 private _entryFee;
    uint256 private _platformFeeBP;
    bool private _paused;

    uint256 public currentRoundId;
    
    // mapping to store round contract addresses (payable for ease of transfers)
    mapping(uint256 => address payable) public roundContracts;

    address public vrfCoordinator;
    bytes32 public keyHash;
    uint256 public subscriptionId;
    uint32 public callbackGasLimit;
    uint16 public requestConfirmations;
   
    constructor(
        address managerAddress,
        address usdcTokenAddress,
        uint256 entryFee,
        uint256 platformFeeBP,
        address vrfCoordinator_,
        bytes32 keyHash_,
        uint256 subscriptionId_,
        uint32 callbackGasLimit_,
        uint16 requestConfirmations_
    ) {
        require(managerAddress != address(0), "InvalidManager");
        require(usdcTokenAddress != address(0), "InvalidUSDCAddress");

        manager = IFortunaManager(managerAddress);
        usdcToken = IERC20(usdcTokenAddress);
        _entryFee = entryFee;
        _platformFeeBP = platformFeeBP;
        _paused = false;

        // Store VRF parameters
        vrfCoordinator = vrfCoordinator_;
        keyHash = keyHash_;
        subscriptionId = subscriptionId_;
        callbackGasLimit = callbackGasLimit_;
        requestConfirmations = requestConfirmations_;

        // NOTE: do NOT call _createNewRound() here to avoid making external calls
        // from the constructor that can revert (e.g. manager permissions). Call
        // createNewRound() after deployment from the admin account.
    }

    modifier notPaused() {
        if (_paused) revert Errors.SystemPaused();
        _;
    }

    function joinRound(uint256 roundId) external override notPaused {
        if (!manager.roundExists(roundId)) revert Errors.InvalidRoundId();

        address payable roundContractAddress = roundContracts[roundId];
        FortunaVRF roundContract = FortunaVRF(roundContractAddress);

        // Transfer USDC from player to the round contract
        bool sent = usdcToken.transferFrom(msg.sender, roundContractAddress, _entryFee);
        if (!sent) revert Errors.TransferFailed();

        roundContract.addPlayer(msg.sender);

        emit PlayerJoined(roundId, msg.sender, _entryFee);

        if (roundContract.isRoundFull() || roundContract.isExpired()) {
            _closeRound(roundId);
        }
    }

    function joinRoundWithPermit(uint256 roundId, uint256 amount, uint256 deadline, bytes memory signature) external notPaused {
        if (!manager.roundExists(roundId)) revert Errors.InvalidRoundId();
        if (amount != _entryFee) revert Errors.InvalidEntryFee();

        address payable roundContractAddress = roundContracts[roundId];
        FortunaVRF roundContract = FortunaVRF(roundContractAddress);

        // Split signature
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        // Use permit to approve spending
        IERC20Permit(address(usdcToken)).permit(msg.sender, address(this), amount, deadline, v, r, s);

        // Transfer USDC from player to the round contract
        bool sent = usdcToken.transferFrom(msg.sender, roundContractAddress, amount);
        if (!sent) revert Errors.TransferFailed();

        roundContract.addPlayer(msg.sender);

        emit PlayerJoined(roundId, msg.sender, amount);

        if (roundContract.isRoundFull() || roundContract.isExpired()) {
            _closeRound(roundId);
        }
    }

    function createNewRound() external override onlyAdmin returns (uint256) {
        return _createNewRound();
    }

    function _createNewRound() internal returns (uint256) {
        currentRoundId += 1;
        uint64 startTime = uint64(block.timestamp);

        // Pass VRF data into the round contract
        FortunaVRF newRound = new FortunaVRF(
            currentRoundId,
            _entryFee,
            startTime,
            address(manager),
            address(this),
            address(usdcToken),
            vrfCoordinator,
            keyHash,
            subscriptionId,
            callbackGasLimit,
            requestConfirmations
        );

        roundContracts[currentRoundId] = payable(address(newRound));

        manager.createRound(currentRoundId, startTime + 60, _entryFee, 50);

        emit NewRoundCreated(currentRoundId, block.timestamp);
        return currentRoundId;
    }

    function _closeRound(uint256 roundId) internal {
        FortunaVRF roundContract = FortunaVRF(roundContracts[roundId]);
        roundContract.closeRound();

        emit RoundClosed(
            roundId,
            manager.totalParticipants(roundId),
            roundContract.getPrizePool()
        );

        _createNewRound();
    }

    function getActiveRound() external view override returns (uint256) {
        return currentRoundId;
    }

    function getRoundInfo(uint256 roundId) external view override returns (Types.RoundInfo memory) {
        FortunaVRF roundContract = FortunaVRF(roundContracts[roundId]);
        return roundContract.getRoundInfo();
    }

    function getEntryFee() external view override returns (uint256) {
        return _entryFee;
    }

    function getPlatformBalance() external view override returns (uint256) {
        return manager.getProtocolFees();
    }

    function setEntryFee(uint256 fee) external onlyAdmin {
        uint256 oldFee = _entryFee;
        _entryFee = fee;
        emit EntryFeeUpdated(oldFee, fee);
    }

    function withdrawPlatformFees(address to) external onlyAdmin {
        manager.withdrawProtocolFees(to);
    }

    function pause() external onlyAdmin {
        _paused = true;
        emit SystemPaused(msg.sender);
    }

    function unpause() external onlyAdmin {
        _paused = false;
        emit SystemUnpaused(msg.sender);
    }
}
