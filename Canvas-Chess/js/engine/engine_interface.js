var EngineInterface = (function(frontEnd) {

	// public Attribute
	var publicInterface = {
		MIN_COMPUTER_LEVEL : 0,
		MAX_COMPUTER_LEVEL : 4,
		PROMOTION_STRINGS : ["queen", "rook", "knight", "bishop"]
	};
	// var PROMOTION_INTS = [P4_QUEEN, P4_ROOK, P4_KNIGHT, P4_BISHOP];

	// private Attribute
	var DEFAULT_COMPUTER_LEVEL = 2; // 0 - 4


	var engine = p4_new_game();
	var computerLevel = DEFAULT_COMPUTER_LEVEL;
	var mate = false;
	var stale = false;
	var pawnPromotion = "queen";

	var frontEnd = frontEnd;


	// public Methoden
	publicInterface.init = function(customState) {
		if (customState != undefined && customState != null && customState != "") {
			p4_fen2state(customState, engine);
		}
	}

	publicInterface.move = function(move) {
		if (move.promotion == null) {
			move.promotion = pawnPromotion;
		}
		var p4Promotion = convertPieceNameToNumber(move.promotion);
		var moveResult = engine.move(move.start, move.target, p4Promotion);
		if (moveResult.flags == P4_MOVE_CHECKMATE) {
			mate = true;
		} else if (moveResult.flags == P4_MOVE_STALEMATE) {
			stale = true;
		}
		if (moveResult.ok) {
			frontEnd.logMove(moveResult.string, engine.moveno);
			//this.display_move_text(engine.moveno, moveResult.string);
			//this.refresh();
			//if (! (moveResult.flags & P4_MOVE_FLAG_MATE)) {
				//this.next_move_timeout = window.setTimeout(
					//function(p4d) {
						//return function() {
							//p4d.next_move();
						//};
					//}(this), 1);
			//}
		} else {
			p4_log("bad move!", move);
		}
		//for (var i = 0; i < this.move_listeners.length; i++) {
		//		this.move_listeners[i](moveResult);
		return moveResult.ok;
	}

	publicInterface.whosTurn = function() {
		return (engine.to_play == 1) ? "black" : "white";
	}

	// move wird nur berechnet, nicht durchgeführt
	publicInterface.computerMove = function() {
		// var autoPlayTimeout = undefined;
		var mv;
		var depth = computerLevel + 1;
		var startTime = Date.now();
		mv = engine.findmove(depth);
		var endTime = Date.now();
		p4_log("findmove took", endTime - startTime);

		//p4wn kann anscheinend adaptive die Suchtiefe erhöhen, lass ich erstmal raus
		//if (P4WN_ADAPTIVE_LEVELS && depth > 2) {
		//		var min_time = 25 * depth;
		//		while (delta < min_time) {
		//				depth++;
		//				mv = engine.findmove(depth);
		//				delta = Date.now() - start_time;
		//				p4_log("retry at depth", depth, " total time:", delta);
		//		}
		//}
		var move = {
			start: convertBoardNotation(mv[0]),
			target: convertBoardNotation(mv[1]),
			promotion: "queen"
		};
		//var start = this.convertBoardNotation(mv[0]);
		//var target = this.convertBoardNotation(mv[1]);
		//var timeout = this.animateMove(start, target,
		//	function() {this.move(mv[0], mv[1]);}.bind(this));
		return move;
	}

	publicInterface.getFeedback = function(move) {
		console.log(move);
		var bestMoves;
		var feedback = "";
		var highscore = "";
		var playerRating = -1;
		var depth = computerLevel + 1;
		var topX = 5;
		bestMoves = engine.findBestXMoves(depth, topX);
		for (var i = 0; i < bestMoves.length; i++) {
			bestMoves[i].start = convertBoardNotation(bestMoves[i].start);
			bestMoves[i].target = convertBoardNotation(bestMoves[i].target);
			if (move.start == bestMoves[i].start && move.target == bestMoves[i].target) {
				playerRating = (i+1);
			}
			highscore += (i+1) + ". " + bestMoves[i].start + " - " + bestMoves[i].target +
			" (" + bestMoves[i].score + ")\n";
		}
		if (playerRating > 0) {
			feedback += "The engine rated your move as the " + playerRating + ". best move." +
			" (Based on a search depth of " + depth + ")\n";
		} else {
			feedback += "Your move is not in the top " + topX + " moves.\n";
		}
		return feedback + highscore;
	}

	publicInterface.getBoard = function() {
		var p4wnBoard = engine.board;
		var normalizedBoard = new Array(8);
		for (var i = 0; i < 8; i++) {
			normalizedBoard[i] = new Array(8);
	    for (var j = 0; j < 8; j++) {
	      var index = 20 + (i*10) + (j+1);
				normalizedBoard[i][j] = p4wnBoard[index]
	    }
	  }
		return normalizedBoard;
	}

	publicInterface.isGameOver = function() {
		if (mate || stale) {
			return true;
		} else {
			return false;
		}
	}

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
		//var div = this.elements.log;
		//for (var i = 0; i < delta; i++) {
		//		div.removeChild(div.lastChild);
		//}
		engine.jump_to_moveno(n);
		mate = false;
		stale = false;
	}

	publicInterface.getFEN = function() {
		return p4_state2fen(engine, false);
	}

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
	}

	publicInterface.setComputerLevel = function(level) {
		if (level >= this.MIN_COMPUTER_LEVEL && level <= this.MAX_COMPUTER_LEVEL) {
			computerLevel = level;
		}
	}

	publicInterface.getComputerLevel = function() {
		return computerLevel;
	}

	publicInterface.increaseComputerLevel = function() {
		if (computerLevel < this.MAX_COMPUTER_LEVEL) {
			computerLevel++;
		}
		return computerLevel;
	}

	publicInterface.decreaseComputerLevel = function() {
		if (computerLevel > this.MIN_COMPUTER_LEVEL) {
			computerLevel--;
		}
		return computerLevel;
	}

	publicInterface.setPawnPromotion = function(promotion) {
		if (promotion != null && this.PROMOTION_STRINGS.indexOf(promotion) >= 0
		&& this.PROMOTION_STRINGS.indexOf(promotion) <= 3) {
			pawnPromotion = promotion;
		}
	}

	// publicInterface.getPawnPromotion = function() {
	// 	return pawnPromotion;
	// }

	publicInterface.getStartFEN = function() {
		return engine.beginning;
	}

	// private Methoden
	function setComputerLevel(level) {
		if (level < 5 && level >= 0) {
			computerLevel = level;
		}
	}

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
	}

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
	}

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
	}

	return publicInterface
});
