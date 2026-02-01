// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "./libraries/Types.sol";
import "./libraries/Errors.sol";
import "./libraries/Events.sol";
import "./IFortunaRound.sol";
import "./IFortunaManager.sol";
import "./IERC20.sol";


contract FortunaVRF is IFortunaRound, VRFConsumerBaseV2 {
    Types.RoundInfo private _info;
    address[] private _participants;
    IFortunaManager public manager;
    address public core;
    IERC20 public usdcToken;

    bool private _prizeDistributed;

    VRFCoordinatorV2Interface private COORDINATOR;
    uint256 private subscriptionId;
    bytes32 private keyHash;
    uint32 private callbackGasLimit;
    uint16 private requestConfirmations;
    uint256 public randomResult;
    bool private randomRequested;

    constructor(
        uint256 roundId_,
        uint256 entryFee_,
        uint256 startTimestamp_,
        address managerAddress_,
        address coreAddress_,
        address usdcTokenAddress_,
        address vrfCoordinator_,
        bytes32 keyHash_,
        uint256 subscriptionId_,
        uint32 callbackGasLimit_,
        uint16 requestConfirmations_
    ) VRFConsumerBaseV2(vrfCoordinator_) {
        require(managerAddress_ != address(0), "InvalidManager");
        require(coreAddress_ != address(0), "InvalidCore");
        require(usdcTokenAddress_ != address(0), "InvalidUSDCAddress");

        _info.roundId = roundId_;
        _info.startTimestamp = startTimestamp_;
        _info.endTimestamp = startTimestamp_ + 60;
        _info.entryFee = entryFee_;
        _info.isClosed = false;
        _info.playerCount = 0;
        _info.winner = address(0);

        manager = IFortunaManager(managerAddress_);
        core = coreAddress_;
        usdcToken = IERC20(usdcTokenAddress_);

        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator_);
        keyHash = keyHash_;
        subscriptionId = subscriptionId_;
        callbackGasLimit = callbackGasLimit_;
        requestConfirmations = requestConfirmations_;
    }

    modifier onlyCore() {
        if (msg.sender != core) revert Errors.NotAuthorized();
        _;
    }

    modifier roundOpen() {
        if (_info.isClosed) revert Errors.RoundAlreadyClosed();
        if (block.timestamp >= _info.endTimestamp) revert Errors.RoundExpired();
        _;
    }

    function addPlayer(address player) external override onlyCore roundOpen {
        if (_participants.length >= 50) revert Errors.RoundFull();
        _participants.push(player);
        _info.playerCount += 1;

        emit PlayerJoined(_info.roundId, player, _info.entryFee);

        if (_participants.length == 50) {
            closeRound();
        }
    }

    function isRoundFull() external view override returns (bool) {
        return _participants.length >= 50;
    }

    function isExpired() external view override returns (bool) {
        return block.timestamp >= _info.endTimestamp;
    }

    function closeRound() public override onlyCore {
        if (_info.isClosed) revert Errors.RoundAlreadyClosed();
        _info.isClosed = true;

        emit RoundClosed(
            _info.roundId,
            _participants.length,
            _info.entryFee * _participants.length
        );

        requestRandomNumber();
    }

    function requestRandomNumber() public returns (bytes32 requestId) {
        if (randomRequested) revert Errors.RandomAlreadyRequested();
        randomRequested = true;

        uint256 _requestId = COORDINATOR.requestRandomWords(
            keyHash,
            uint64(subscriptionId),
            requestConfirmations,
            callbackGasLimit,
            1
        );

        requestId = bytes32(_requestId);

        emit RandomnessRequested(_info.roundId, requestId);
        return requestId;
    }

    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
        randomResult = randomWords[0];

        uint256 winnerIndex = randomResult % _participants.length;
        _info.winner = _participants[winnerIndex];

        emit WinnerSelected(
            _info.roundId,
            _info.winner,
            _info.entryFee * _participants.length
        );
    }

    function distributePrize() external override onlyCore {
        if (!_info.isClosed) revert Errors.RoundNotExpired();
        if (_info.winner == address(0)) revert Errors.InvalidOperation();
        if (_prizeDistributed) revert Errors.InvalidOperation();

        _prizeDistributed = true;

        uint256 totalPrize = usdcToken.balanceOf(address(this));
        uint256 platformFee = (totalPrize * 2) / 100;
        uint256 winnerPrize = totalPrize - platformFee;

        usdcToken.transfer(_info.winner, winnerPrize);
        usdcToken.transfer(address(manager), platformFee);

        emit PlatformFeeCollected(_info.roundId, platformFee);
    }

    function getRoundInfo() external view override returns (Types.RoundInfo memory) {
        return _info;
    }

    function getParticipants() external view override returns (address[] memory) {
        return _participants;
    }

    function timeRemaining() external view override returns (uint256) {
        if (block.timestamp >= _info.endTimestamp) return 0;
        return _info.endTimestamp - block.timestamp;
    }

    function getRoundId() external view override returns (uint256) {
        return _info.roundId;
    }

    function getPrizePool() external view override returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }
}
