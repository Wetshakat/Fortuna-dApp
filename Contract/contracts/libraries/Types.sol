// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Enum for card shapes
enum Shape {
    Circle,
    Triangle,
    Cross,
    Square,
    Star,
    Whot
}

// Struct to represent a card
struct Card {
    uint8 number; // 1-14
    Shape shape;
}

library Types {
    struct Round {
        bool exists;
        bool closed;
        address winner;
        uint64 closeTime;
        uint256 entryPrice;
        uint32 maxParticipants;
        uint32 participantCount;
    }

    struct RoundInfo {
        uint256 roundId;
        uint256 startTimestamp;
        uint256 endTimestamp;
        uint256 entryFee;
        uint256 prizePool;
        uint256 playerCount;
        bool isClosed;
        address winner;
    }

    struct PlayerInfo {
        address player;
        uint256 entryTimestamp;
        uint256 roundId;
        bool refunded;
    }

    struct RandomRequest {
        bytes32 requestId;
        bool fulfilled;
        uint256 randomness;
    }

    struct SystemConfig {
        uint256 entryFee;
        uint256 platformFeeBP;
        bool isPaused;
    }
}
