// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FortunaVRF.sol";
import "./libraries/Errors.sol";
import "./libraries/Events.sol";
import "./libraries/Types.sol";

/// @title FortunaWhot
/// @author Your Name
/// @notice A decentralized Whot card game contract.
contract FortunaWhot is FortunaVRF {
    // Struct to represent a player
    struct Player {
        address addr;
        Card[] hand;
    }

    // Enum for game status
    enum GameStatus {
        Pending,
        Active,
        Finished
    }

    // Struct for a game session
    struct GameSession {
        Player[] players;
        uint256 gameId;
        uint256 betAmount;
        uint8 currentPlayerIndex;
        GameStatus status;
        Card topCard;
        Shape currentShape;
        uint256[] deck;
        mapping(address => bool) hasPlayer;
    }

    // Mapping from gameId to GameSession
    mapping(uint256 => GameSession) public gameSessions;

    // Counter for game IDs
    uint256 public nextGameId;

    // Constant for the number of cards in a deck
    uint256 private constant DECK_SIZE = 54;

    /// @notice Initializes a new game session.
    /// @param _gameId The ID of the game.
    /// @param _betAmount The amount of the bet.
    function newGame(uint256 _gameId, uint256 _betAmount) external {
        if (gameSessions[_gameId].gameId != 0) {
            revert FortunaWhot_GameAlreadyExists();
        }

        GameSession storage game = gameSessions[_gameId];
        game.gameId = _gameId;
        game.betAmount = _betAmount;
        game.status = GameStatus.Pending;
    }

    /// @notice Allows a player to join a game.
    /// @param _gameId The ID of the game.
    function joinGame(uint256 _gameId) external payable {
        GameSession storage game = gameSessions[_gameId];
        if (game.gameId == 0) {
            revert FortunaWhot_GameNotFound();
        }
        if (game.status != GameStatus.Pending) {
            revert FortunaWhot_GameNotPending();
        }
        if (game.players.length >= 6) {
            revert FortunaWhot_GameFull();
        }
        if (msg.value != game.betAmount) {
            revert FortunaWhot_IncorrectBetAmount();
        }
        if (game.hasPlayer[msg.sender]) {
            revert FortunaWhot_PlayerAlreadyJoined();
        }

        game.players.push(Player({addr: msg.sender, hand: new Card[](0)}));
        game.hasPlayer[msg.sender] = true;
        emit PlayerJoined(_gameId, msg.sender);
    }

    /// @notice Starts a game session.
    /// @param _gameId The ID of the game.
    function startGame(uint256 _gameId) external {
        GameSession storage game = gameSessions[_gameId];
        if (game.gameId == 0) {
            revert FortunaWhot_GameNotFound();
        }
        if (game.status != GameStatus.Pending) {
            revert FortunaWhot_GameNotPending();
        }
        if (game.players.length < 2) {
            revert FortunaWhot_NotEnoughPlayers();
        }

        // Request randomness for shuffling
        requestRandomWords();

        game.status = GameStatus.Active;
        emit GameStarted(_gameId);
    }

    /// @notice Allows a player to play a card.
    /// @param _gameId The ID of the game.
    /// @param _cardIndex The index of the card in the player's hand.
    /// @param _newShape The new shape if a Whot card is played.
    function playCard(uint256 _gameId, uint256 _cardIndex, Shape _newShape) external {
        GameSession storage game = gameSessions[_gameId];
        if (game.gameId == 0) {
            revert FortunaWhot_GameNotFound();
        }
        if (game.status != GameStatus.Active) {
            revert FortunaWhot_GameNotActive();
        }
        if (game.players[game.currentPlayerIndex].addr != msg.sender) {
            revert FortunaWhot_NotYourTurn();
        }

        Player storage player = game.players[game.currentPlayerIndex];
        if (_cardIndex >= player.hand.length) {
            revert FortunaWhot_InvalidCardIndex();
        }

        Card memory cardToPlay = player.hand[_cardIndex];
        if (cardToPlay.shape != Shape.Whot && cardToPlay.shape != game.currentShape && cardToPlay.number != game.topCard.number) {
            revert FortunaWhot_InvalidCard();
        }

        // Update top card and current shape
        game.topCard = cardToPlay;
        if (cardToPlay.shape == Shape.Whot) {
            game.currentShape = _newShape;
        } else {
            game.currentShape = cardToPlay.shape;
        }

        // Remove card from player's hand
        player.hand[_cardIndex] = player.hand[player.hand.length - 1];
        player.hand.pop();

        emit CardPlayed(_gameId, msg.sender, cardToPlay.number, cardToPlay.shape);

        // Check for winner
        if (player.hand.length == 0) {
            game.status = GameStatus.Finished;
            emit GameFinished(_gameId, msg.sender);
        } else {
            // Move to next player
            game.currentPlayerIndex = (game.currentPlayerIndex + 1) % uint8(game.players.length);
            emit TurnChanged(_gameId, game.players[game.currentPlayerIndex].addr);
        }
    }

    /// @notice Allows a player to draw a card from the deck.
    /// @param _gameId The ID of the game.
    function drawCard(uint256 _gameId) external {
        GameSession storage game = gameSessions[_gameId];
        if (game.gameId == 0) {
            revert FortunaWhot_GameNotFound();
        }
        if (game.status != GameStatus.Active) {
            revert FortunaWhot_GameNotActive();
        }
        if (game.players[game.currentPlayerIndex].addr != msg.sender) {
            revert FortunaWhot_NotYourTurn();
        }
        if (game.deck.length == 0) {
            revert FortunaWhot_DeckEmpty();
        }

        Player storage player = game.players[game.currentPlayerIndex];
        Card memory drawnCard = _decodeCard(game.deck[game.deck.length - 1]);
        game.deck.pop();
        player.hand.push(drawnCard);

        emit CardDrawn(_gameId, msg.sender, drawnCard.number, drawnCard.shape);

        // Move to next player
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % uint8(game.players.length);
        emit TurnChanged(_gameId, game.players[game.currentPlayerIndex].addr);
    }

    /// @notice Fulfills the request for random words to shuffle the deck.
    /// @param _requestId The ID of the request.
    /// @param _randomWords The random words returned by the VRF.
    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        uint256 gameId = s_requests[_requestId].gameId;
        GameSession storage game = gameSessions[gameId];
        if (game.gameId == 0) {
            revert FortunaWhot_GameNotFound();
        }

        // Initialize deck
        for (uint256 i = 0; i < DECK_SIZE; i++) {
            game.deck.push(i);
        }

        // Shuffle deck
        uint256 randomSeed = _randomWords[0];
        for (uint256 i = DECK_SIZE - 1; i > 0; i--) {
            uint256 j = randomSeed % (i + 1);
            uint256 temp = game.deck[i];
            game.deck[i] = game.deck[j];
            game.deck[j] = temp;
            randomSeed = uint256(keccak256(abi.encodePacked(randomSeed)));
        }

        // Deal cards
        for (uint256 i = 0; i < game.players.length; i++) {
            for (uint256 j = 0; j < 5; j++) {
                game.players[i].hand.push(_decodeCard(game.deck[game.deck.length - 1]));
                game.deck.pop();
            }
        }

        // Set top card
        game.topCard = _decodeCard(game.deck[game.deck.length - 1]);
        game.deck.pop();
        game.currentShape = game.topCard.shape;

        emit DeckShuffled(gameId);
    }

    /// @notice Decodes a card from its uint256 representation.
    /// @param _encodedCard The encoded card.
    /// @return The decoded card.
    function _decodeCard(uint256 _encodedCard) internal pure returns (Card memory) {
        uint8 number = uint8((_encodedCard % 14) + 1);
        Shape shape = Shape(uint8(_encodedCard / 14));
        return Card(number, shape);
    }
}
