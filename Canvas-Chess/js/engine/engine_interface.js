
/**
 * Constructor
 * Module design pattern
 * Provides an interface for a specific chess engine to make it usable for the
 * frontend.
 */
var EngineInterface = (function() {

	// public attributes
	var publicInterface = {
		MIN_COMPUTER_LEVEL : 0,
		MAX_COMPUTER_LEVEL : 4,
		PROMOTION_STRINGS : ["queen", "rook", "knight", "bishop"]
	};

	// private attributes
	var DEFAULT_COMPUTER_LEVEL = 2; // 0 - 4

	var engine = p4_new_game();
	var computerLevel = DEFAULT_COMPUTER_LEVEL;
	var mate = false;
	var stale = false;
	var pawnPromotion = "queen";

	// public methods

	/**
	 * Tries to load a custom board state into the engine.
	 * @param customState		FEN-string defining the board state.
	 */
	publicInterface.init = function(customState) {
		if (customState != undefined && customState != null && customState != "") {
			p4_fen2state(customState, engine);
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
		var p4Promotion = convertPieceNameToNumber(move.promotion);
		var engineResult = engine.move(move.start, move.target, p4Promotion);
		if (engineResult.flags == P4_MOVE_CHECKMATE) {
			mate = true;
		} else if (engineResult.flags == P4_MOVE_STALEMATE) {
			stale = true;
		}
		var moveResult = {
			ok: engineResult.ok,
			moveNumber: -1,
			string: ""
		};
		if (moveResult.ok) {
			moveResult.moveNumber = engine.moveno;
			moveResult.string = engineResult.string;
		} else {
			p4_log("bad move!", move);
		}
		return moveResult;
	};

	/**
	 * Gets the the color, which is to move.
 	 * @return "black" or "white"
	 */
	publicInterface.whosTurn = function() {
		return (engine.to_play == 1) ? "black" : "white";
	};

	/**
	 * Calculates the move, the computer / engine will do next.
 	 * @return move as {start-field, target-field, promotion}
	 */
	publicInterface.computerMove = function() {
		var mv;
		var depth = computerLevel + 1;
		var startTime = Date.now();
		mv = engine.findmove(depth);
		var endTime = Date.now();
		p4_log("findmove took", endTime - startTime);
		var move = {
			start: convertBoardNotation(mv[0]),
			target: convertBoardNotation(mv[1]),
			promotion: "queen"
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
		var bestMoves;
		var highscore = "";
		var playerPlace = -1;
		var playerRating = null;
		var depth = computerLevel + 1;
		var topX = 5;
		bestMoves = engine.getRatedPossibleMoves(depth);
		for (var i = 0; i < bestMoves.length; i++) {
			bestMoves[i].start = convertBoardNotation(bestMoves[i].start);
			bestMoves[i].target = convertBoardNotation(bestMoves[i].target);
			if (move.start == bestMoves[i].start && move.target == bestMoves[i].target) {
				playerPlace = (i+1);
				playerRating = bestMoves[i].score;
			}
			if ((i+1) <= topX) {
				highscore += (i+1) + ". " + bestMoves[i].start + " - " +
					bestMoves[i].target + " (" + bestMoves[i].score + ")\n";
			}
		}

		if (playerPlace == -1) {
			return "Illegal move.";
		}

		var feedback = "";
		var ratedMove = "(" + move.start + " - " + move.target +	" | Rating: " +
			playerRating + ")";
		if (playerPlace <= topX) {
			feedback += "The engine rated your move " + ratedMove + " as the " +
				playerPlace + ". best move. (Based on a search depth of " + depth + ")\n";
		} else {
			feedback += "Your move " + ratedMove + " is not in the top " + topX +
				" moves.\n";
		}
		return feedback + highscore;
	};

	/**
	 * Generates a normalized version of the board.
 	 * @return 8x8 array, containing "color-type" for a piece or "" for an empty field
	 */
	publicInterface.getBoard = function() {
		var p4wnBoard = engine.board;
		var normalizedBoard = new Array(8);
		for (var i = 0; i < 8; i++) {
			normalizedBoard[i] = new Array(8);
	    for (var j = 0; j < 8; j++) {
	      var index = 20 + (i*10) + (j+1);
				normalizedBoard[i][j] = convertPieceBoardToString(p4wnBoard[index]);
	    }
	  }
		return normalizedBoard;
	};

	/**
	 * Checks whether the game is over due to checkmate or stalemate.
 	 * @return true, if game is over / false, if game is not over
	 */
	publicInterface.isGameOver = function() {
		if (mate || stale) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Replays the first n halfmoves of the current game within the engine.
	 * @param n		Total number of halfmoves that should be replayed
	 */
	publicInterface.goToMove = function(n) {
		var delta;
		if (n < 0) {
			delta = -n;
		} else {
			delta = engine.moveno - n;
		}
		if (delta > engine.moveno) {
			delta = engine.moveno;
		}
		engine.jump_to_moveno(n);
		mate = false;
		stale = false;
	};

	/**
	 * Generates the FEN-string for the current state of the game.
 	 * @return String, containing FEN-notation of the current state
	 */
	publicInterface.getFEN = function() {
		return p4_state2fen(engine, false);
	};

	/**
	 * Generates the FEN-string for the starting state of the game.
	 * @return String, containing FEN-notation of the starting state
	 */
	publicInterface.getStartFEN = function() {
		return engine.beginning;
	};

	/**
	 * Generates a
 	 * @return Array, containing all moves of the current game as
	 * {start-field, target-field, promotion}
	 */
	publicInterface.getMoveHistory = function() {
		var moves = [];
		for (var i = 0; i < engine.history.length; i++) {
			var mv = engine.history[i];
			var move = {
				start: convertBoardNotation(mv[0]),
				target: convertBoardNotation(mv[1]),
				promotion: convertPieceNumberToName(mv[2])
			};
			moves[i] = move;
		}
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

	// private methods
	/**
	 * Converts the P4wn field-IDs to normalized IDs between "a1" and "h8".
	 * @param p4wnFieldID		P4wn field-ID
 	 * @return String, containing the normalited ID
	 */
	function convertBoardNotation(p4wnFieldID) {
		var id = p4wnFieldID - 10;
	  var idY = Math.floor(id / 10);
	  var idX = id - (idY*10);
	  var fieldID = "";
	  switch (idX) {
	    case 1: fieldID = "a"; break;
	    case 2: fieldID = "b"; break;
	    case 3: fieldID = "c"; break;
	    case 4: fieldID = "d"; break;
	    case 5: fieldID = "e"; break;
	    case 6: fieldID = "f"; break;
	    case 7: fieldID = "g"; break;
	    case 8: fieldID = "h"; break;
	  }
	  fieldID += idY;
	  return fieldID;
	};

	/**
	 * Converts the numbers that P4wn uses for pieces to normalized names.
	 * @param pieceNumber		P4wn piece number
 	 * @return String, containing the piece name
	 */
	function convertPieceNumberToName(pieceNumber) {
		var pieceName = "";
		switch (pieceNumber) {
			case P4_PAWN: pieceName = "pawn"; break;
			case P4_ROOK: pieceName = "rook"; break;
			case P4_KNIGHT: pieceName = "knight"; break;
			case P4_BISHOP: pieceName = "bishop"; break;
			case P4_QUEEN: pieceName = "queen"; break;
			case P4_KING: pieceName = "king"; break;
			default: pieceName = ""; break;
		}
		return pieceName;
	};

	/**
	 * Converts normalized names to the numbers that P4wn uses for pieces.
	 * @param pieceName		Normalized name of the piece
 	 * @return Integer, containing the P4wn piece number
	 */
	function convertPieceNameToNumber(pieceName) {
		var pieceNumber = -1;
		switch (pieceName) {
			case "pawn": pieceNumber = P4_PAWN; break;
			case "rook": pieceNumber = P4_ROOK; break;
			case "knight": pieceNumber = P4_KNIGHT; break;
			case "bishop": pieceNumber = P4_BISHOP; break;
			case "queen": pieceNumber = P4_QUEEN; break;
			case "king": pieceNumber = P4_KING; break;
			default: pieceNumber = -1; break;
		}
		return pieceNumber;
	};

	/**
	 * Converts the board notation that P4wn uses for the piece to normalized descriptions.
	 * @param boardNumber		P4wn board number for a piece
 	 * @return String, containing the normalized piece description as "color-type"
	 */
	function convertPieceBoardToString(boardNumber) {
		var pieceString = "";
		switch (boardNumber) {
			case 2: pieceString = "white-pawn"; break;
			case 3: pieceString = "black-pawn"; break;
			case 4: pieceString = "white-rook"; break;
			case 5: pieceString = "black-rook"; break;
			case 6: pieceString = "white-knight"; break;
			case 7: pieceString = "black-knight"; break;
			case 8: pieceString = "white-bishop"; break;
			case 9: pieceString = "black-bishop"; break;
			case 10: pieceString = "white-king"; break;
			case 11: pieceString = "black-king"; break;
			case 12: pieceString = "white-queen"; break;
			case 13: pieceString = "black-queen"; break;
			default: break;
		}
		return pieceString;
	};

	return publicInterface
});
