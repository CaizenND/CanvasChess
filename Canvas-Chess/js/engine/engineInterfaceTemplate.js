
/**
 * Constructor
 * Module design pattern
 * Provides an interface for a specific chess engine to make it usable for the
 * frontend.
 */
var EngineInterface = (function() {

	// public attributes
	var publicInterface = {
		MIN_COMPUTER_LEVEL : /* Minimal engine difficulty */,
		MAX_COMPUTER_LEVEL : /* Maximal engine difficulty */,
		PROMOTION_STRINGS : ["queen", "rook", "knight", "bishop"]
	};

	// private attributes
	var DEFAULT_COMPUTER_LEVEL = /* Default engine difficulty */;

	/* Engine specific attributes */
	var computerLevel = DEFAULT_COMPUTER_LEVEL;
	var pawnPromotion = "queen";

	// public methods

	/**
	 * Tries to load a custom board state into the engine.
	 * @param customState		FEN-string defining the board state.
	 */
	publicInterface.init = function(customState) {
		if (customState != undefined && customState != null && customState != "") {
			/* Initialize engine with custom state (FEN-string) */
		}
	};

	/**
	 * Tries to perform a move in the engine.
	 * @param move		{start-field, target-field, promotion	(normally not needed)}
	 * @return moveResult as {ok, moveNumber, string}
	 */
	publicInterface.move = function(move) {
		if (move.promotion == null) {
			move.promotion = pawnPromotion;
		}
		/* Perform move in engine */
		var moveResult = {
			ok: /* Was the move legal & successfull? */,
			moveNumber: -1,
			string: ""
		};
		if (/* Was the move legal & successfull? */) {
			moveResult.moveNumber = /* Number of the last move */;
			moveResult.string = /* String that should be logged for this move */;
		}
		return moveResult;
	};

	/**
	 * Gets the the color, which is to move.
 	 * @return "black" or "white"
	 */
	publicInterface.whosTurn = function() {
		var toMove = /* Color, which is to move */;
		return toMove;
	};

	/**
	 * Calculates the move, the computer / engine will do next.
 	 * @return move as {start-field, target-field, promotion}
	 */
	publicInterface.computerMove = function() {
		/* Let the engine calculate its next move using the current computer level */
		var move = {
			start: /* Starting field for the computer move */,
			target: /* Target field for the computer move */,
			promotion: /* Promotion for the computer move */
		};
		return move;
	};

	/**
	 * Generates feedback for a given move.
	 + If the engine does not support this, the method can be undefined.
	 * @param move 	{start-field, target-field, promotion} that should be rated
 	 * @return String, containing the feedback
	 */
	publicInterface.getFeedback = function(move) {
		var feedback = /* Generate feedback for the given move */;
		return feedback;
	};

	/**
	 * Generates a normalized version of the board.
 	 * @return 8x8 String array, containing "color-type" for a piece or "" for an empty field
	 */
	publicInterface.getBoard = function() {
		var normalizedBoard = /* Convert the engines board representation to an 8x8 String array*/;
		return normalizedBoard;
	};

	/**
	 * Checks whether the game is over due to checkmate or stalemate.
 	 * @return true, if game is over / false, if game is not over
	 */
	publicInterface.isGameOver = function() {
		var gameOver = /* Check whether the game is over */;
		return gameOver;
	};

	/**
	 * Replays the first n halfmoves of the current game within the engine.
	 * @param n		Total number of halfmoves that should be replayed
	 */
	publicInterface.goToMove = function(n) {
		/* Reset board to an earlier state, given by the move number */
	};

	/**
	 * Generates the FEN-string for the current state of the game.
 	 * @return String, containing FEN-notation of the current state
	 */
	publicInterface.getFEN = function() {
		var fen = /* Generate the FEN-string for the current board state */;
		return fen;
	};

	/**
	 * Generates the FEN-string for the starting state of the game.
	 * @return String, containing FEN-notation of the starting state
	 */
	publicInterface.getStartFEN = function() {
		var fen = /* Generate the FEN-string for starting board state */;
		return fen;
	};

	/**
	 * Generates an Array containing all moves, which were made in the current game
 	 * @return Array, containing all moves of the current game as
	 * {start-field, target-field, promotion}
	 */
	publicInterface.getMoveHistory = function() {
		var moves = /* Generate an Array containing all moves */;
		return moves;
	};

	/**
	 * Sets the computer- /engine-difficulty to a given value
	 * @param level		New difficulty for the computer / engine
	 * @return Integer, containing the new computer- / engine-difficulty
	 */
	publicInterface.setComputerLevel = function(level) {
		if (level >= this.MIN_COMPUTER_LEVEL && level <= this.MAX_COMPUTER_LEVEL) {
			computerLevel = level;
		}
		return computerLevel;
	};

	/**
	 * Gets the current computer- / engine-difficulty.
 	 * @return Current computer- / engine-difficulty
	 */
	publicInterface.getComputerLevel = function() {
		return computerLevel;
	};

	/**
	 * Sets the pawn-promotion for player moves.
	 * @param promotion		String, containing piece type of the new pawn-promotion
	 */
	publicInterface.setPawnPromotion = function(promotion) {
		if (promotion != null && this.PROMOTION_STRINGS.indexOf(promotion) >= 0
		&& this.PROMOTION_STRINGS.indexOf(promotion) <= 3) {
			pawnPromotion = promotion;
		}
	};

	return publicInterface
});
