// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Types.sol";

// FortunaManager Events
event GameCreated(uint256 indexed gameId, string name, address indexed contractAddress);
event GameUpdated(uint256 indexed gameId, string name, address indexed contractAddress);
event NewRoundCreated(uint256 indexed roundId, uint256 startTime);
event EntryFeeUpdated(uint256 oldFee, uint256 newFee);
event SystemPaused(address indexed admin);
event SystemUnpaused(address indexed admin);
event CoreUpdated(address indexed core);
event ProtocolFeeWithdrawn(address indexed to, uint256 amount);


// FortunaVRF Events
event RequestSent(uint256 indexed requestId, uint32 numWords);
event RequestFulfillerUpdated(address indexed fulfiller);
event RoundClosed(uint256 indexed roundId, uint256 playerCount, uint256 prizePool);
event RandomnessRequested(uint256 indexed roundId, bytes32 requestId);
event WinnerSelected(uint256 indexed roundId, address indexed winner, uint256 prize);
event PlatformFeeCollected(uint256 indexed roundId, uint256 fee);

// FortunaWhot Events
event PlayerJoined(uint256 indexed gameId, address indexed player, uint256 entryFee);
event GameStarted(uint256 indexed gameId);
event DeckShuffled(uint256 indexed gameId);
event CardPlayed(uint256 indexed gameId, address indexed player, uint8 number, Shape shape);
event CardDrawn(uint256 indexed gameId, address indexed player, uint8 number, Shape shape);
event TurnChanged(uint256 indexed gameId, address indexed nextPlayer);
event GameFinished(uint256 indexed gameId, address indexed winner);
