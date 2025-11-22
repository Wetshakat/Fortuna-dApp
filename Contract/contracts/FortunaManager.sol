// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./libraries/Types.sol";
import "./libraries/Errors.sol";
import "./libraries/Events.sol";
import "./IFortunaManager.sol";
import "./access/Admin.sol";

contract FortunaManager is IFortunaManager, Admin {
    mapping(uint256 => Types.RoundInfo) private _rounds;
    mapping(uint256 => address[]) private _participants;
    mapping(uint256 => mapping(address => bool)) private _hasEntered;
    mapping(uint256 => uint32) private _maxParticipants;
    mapping(uint256 => bool) private _roundExists;

    uint256 private _protocolFees;
    address public core;

    modifier onlyCore() {
        if (msg.sender != core) revert Errors.OnlyCoreCanCall();
        _;
    }

    function setCore(address _core) external onlyAdmin {
        if (_core == address(0)) revert Errors.InvalidAddress();
        core = _core;
        emit Events.CoreUpdated(_core);
    }

    function createRound(
        uint256 roundId,
        uint64 closeTime,
        uint256 entryPrice,
        uint32 maxParticipants
    ) external override onlyCore {
        if (_roundExists[roundId]) revert Errors.InvalidOperation();
        if (closeTime <= block.timestamp) revert Errors.InvalidCloseTime();

        _rounds[roundId] = Types.RoundInfo({
            roundId: roundId,
            startTimestamp: block.timestamp,
            endTimestamp: closeTime,
            entryFee: entryPrice,
            prizePool: 0,
            playerCount: 0,
            isClosed: false,
            winner: address(0)
        });

        _roundExists[roundId] = true;
        _maxParticipants[roundId] = maxParticipants;

        emit Events.NewRoundCreated(roundId, block.timestamp);
    }

    function registerEntry(uint256 roundId, address player) external override onlyCore {
        if (!_roundExists[roundId]) revert Errors.InvalidRoundId();
        Types.RoundInfo storage r = _rounds[roundId];

        if (r.isClosed) revert Errors.RoundAlreadyClosed();
        if (block.timestamp >= r.endTimestamp) revert Errors.RoundExpired();
        if (_participants[roundId].length >= _maxParticipants[roundId]) revert Errors.RoundFull();
        if (_hasEntered[roundId][player]) revert Errors.InvalidOperation();

        _participants[roundId].push(player);
        _hasEntered[roundId][player] = true;
        r.playerCount += 1;
        r.prizePool += r.entryFee;

        _protocolFees += r.entryFee;

        emit Events.PlayerJoined(roundId, player, r.entryFee);
    }

    function closeRound(uint256 roundId) external override onlyCore {
        if (!_roundExists[roundId]) revert Errors.InvalidRoundId();
        Types.RoundInfo storage r = _rounds[roundId];

        if (r.isClosed) revert Errors.RoundAlreadyClosed();
        if (block.timestamp < r.endTimestamp) revert Errors.RoundNotExpired();

        r.isClosed = true;

        emit Events.RoundClosed(roundId, r.playerCount, r.prizePool);
    }

    function setWinner(uint256 roundId, address winner) external override onlyCore {
        if (!_roundExists[roundId]) revert Errors.InvalidRoundId();
        Types.RoundInfo storage r = _rounds[roundId];

        if (!r.isClosed) revert Errors.RoundNotExpired();
        if (winner == address(0)) revert Errors.InvalidAddress();

        r.winner = winner;

        emit Events.WinnerSelected(roundId, winner, r.prizePool);
    }

    function withdrawProtocolFees(address to) external override onlyAdmin {
        if (to == address(0)) revert Errors.InvalidAddress();
        uint256 amount = _protocolFees;
        _protocolFees = 0;

        (bool sent, ) = to.call{value: amount}("");
        if (!sent) revert Errors.TransferFailed();

        emit Events.ProtocolFeeWithdrawn(to, amount);
    }

    function getRound(uint256 roundId) external view override returns (Types.RoundInfo memory) {
        return _rounds[roundId];
    }

    function getParticipants(uint256 roundId) external view override returns (address[] memory) {
        return _participants[roundId];
    }

    function hasEntered(uint256 roundId, address player) external view override returns (bool) {
        return _hasEntered[roundId][player];
    }

    function getProtocolFees() external view override returns (uint256) {
        return _protocolFees;
    }

    function roundExists(uint256 roundId) external view override returns (bool) {
        return _roundExists[roundId];
    }

    function totalParticipants(uint256 roundId) external view override returns (uint256) {
        return _participants[roundId].length;
    }

    function getMaxParticipants(uint256 roundId) external view returns (uint32) {
        return _maxParticipants[roundId];
    }
}
