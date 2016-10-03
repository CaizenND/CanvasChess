
var EngineInterface = (function() {

	// public Attribute
	var PublicInterface = {

	}

	// private Attribute
	var engine = null;
	var pawn_promotion = 0;
	var computer_level = 2;
	var mate = false;
	var stale = false;

	var P4WN_PROMOTION_INTS = [P4_QUEEN, P4_ROOK, P4_KNIGHT, P4_BISHOP];

	// public Methoden
	PublicInterface.init = function(customState) {
		engine = p4_new_game();
		if (customState != "") {
			p4_fen2state(customState, engine);
		}
	}

	PublicInterface.move = function(start, target) {
		var move_result = engine.move(start, target, P4WN_PROMOTION_INTS[pawn_promotion]);
		if (move_result.flags == P4_MOVE_CHECKMATE) {
			mate = true;
		} else if (move_result.flags == P4_MOVE_STALEMATE) {
			stale = true;
		}
		if (move_result.ok) {
			//this.display_move_text(engine.moveno, move_result.string);
			//this.refresh();
			// P4_MOVE_FLAG_MATE == Patt
			//if (! (move_result.flags & P4_MOVE_FLAG_MATE)) {
				//this.next_move_timeout = window.setTimeout(
					//function(p4d) {
						//return function() {
							//p4d.next_move();
						//};
					//}(this), 1);
			//}
		} else {
			p4_log("bad move!", start, target);
		}
		//for (var i = 0; i < this.move_listeners.length; i++) {
		//		this.move_listeners[i](move_result);
		return move_result.ok;
	}

	PublicInterface.whosTurn = function() {
		return (engine.to_play == 1) ? "black" : "white";
	}

	// move wird nur berechnet, nicht durchgeführt
	PublicInterface.computerMove = function() {
		var auto_play_timeout = undefined;
		var mv;
		var depth = computer_level + 1;
		//var start_time = Date.now();
		mv = engine.findmove(depth);
		//var delta = Date.now() - start_time;
		//p4_log("findmove took", delta);
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
			target: convertBoardNotation(mv[1])
		};
		//var start = this.convertBoardNotation(mv[0]);
		//var target = this.convertBoardNotation(mv[1]);
		//var timeout = this.animateMove(start, target,
		//	function() {this.move(mv[0], mv[1]);}.bind(this));
		return move;
	}

	PublicInterface.getBoard = function() {
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

	PublicInterface.isGameOver = function() {
		if (mate || stale) {
			return true;
		} else {
			return false;
		}
	}

	PublicInterface.goToMove = function(n) {
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

	// private Methoden
	function setComputerLevel(level) {
		if (level < 5 && level >= 0) {
			computer_level = level;
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

	return PublicInterface
});
