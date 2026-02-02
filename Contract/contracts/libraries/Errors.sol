// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// FortunaCore Errors
error FortunaCore_NotManager();
error FortunaCore_AddressZero();

// FortunaManager Errors
error FortunaManager_NotAdmin();
error FortunaManager_AddressZero();
error FortunaManager_GameAlreadyExists();
error FortunaManager_GameNotFound();

// FortunaVRF Errors
error FortunaVRF_NotAdmin();
error FortunaVRF_AddressZero();
error FortunaVRF_InvalidSubscriptionId();

// FortunaWhot Errors
error FortunaWhot_GameAlreadyExists();
error FortunaWhot_GameNotFound();
error FortunaWhot_GameNotPending();
error FortunaWhot_GameFull();
error FortunaWhot_IncorrectBetAmount();
error FortunaWhot_PlayerAlreadyJoined();
error FortunaWhot_NotEnoughPlayers();
error FortunaWhot_GameNotActive();
error FortunaWhot_NotYourTurn();
error FortunaWhot_InvalidCardIndex();
error FortunaWhot_InvalidCard();
error FortunaWhot_DeckEmpty();


library Errors {
    error RoundFull();
    error RoundNotFull();
    error RoundAlreadyClosed();
    error RoundNotExpired();
    error RoundExpired();
    error RoundNotStarted();
    error RoundInProgress();
    error InvalidRoundId();

    error InvalidEntryFee();
    error ZeroEntry();
    error NotEnoughPlayers();
    error TransferFailed();
    error RefundFailed();

    error NotOwner();
    error InvalidFeePercentage();
    error SystemPaused();
    error SystemNotPaused();

    error RandomNotRequested();
    error RandomAlreadyRequested();
    error RandomPending();
    error InvalidRandomResponse();

    error NotAuthorized();
    error OnlyCoreCanCall();
    error OnlyManagerCanCall();

    error InvalidAddress();
    error InvalidOperation();
    error InvalidState();
    error InvalidCloseTime();
}
