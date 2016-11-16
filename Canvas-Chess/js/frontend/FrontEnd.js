var FrontEnd = (function(id, customStart, editMode) {

	// public Attribute
	var publicInterface = {
    SQUARE_SIZE : 60, // 40
    BOARD_OFFSET_TOP : 32,
    BOARD_OFFSET_LEFT : 32,
		CANVAS_OFFSET_TOP : 0,
		CANVAS_OFFSET_LEFT : 0,
    interactionMode : 2,		// Drag & Drop (1), Click - Move - Click (2)
    chessboard : null
	}

	// private Attribute
	var replay = {};

	var engineInterface = new EngineInterface(publicInterface);

	var boardEditor = null;

	// TODO: braucht man die überhaupt?
	var INNER_DIV_CLASS = "inner";

  var BOARD_CANVAS_CLASS = "boardCanvas";

	var LOGGING_DIV_CLASS = "logging";

  var CONTROL_DIV_CLASS = "controls";

  var elements = {};

  var players = ["human", "human"]; //[white, black] controllers - "human", "computer"

	var	active = true;

  var autoPlayTimeout = undefined;

  // public Methoden
	// TODO: moves immer als Klasse weitergeben, nicht start, target, promotion
	publicInterface.move = function(move) {
    var moveResult = engineInterface.move(move);
    if (moveResult && !engineInterface.isGameOver()) {
      this.nextMove_timeout = window.setTimeout(
        function(next) {
          return function() {
            next();
          };
        }(nextMove), 1);
    }
    return moveResult;
  };

  publicInterface.refresh = function() {
    publicInterface.chessboard.loadBoard(engineInterface.getBoard());
		// TODO: ANimationen mit requestanimationframe?
		elements.boardCanvas.draw();
  };

	publicInterface.exportGameToXML = function() {
		var fen = engineInterface.getStartFEN();
		if (fen != null) {
			var xml = "<ChessGame>\n\t<StartingPosition>" + fen + "</StartingPosition>";
			var history = engineInterface.getMoveHistory();
			for (var i = 0; i < history.length; i++) {
				var move = history[i];
				xml += "\n\t<Move id=\"" + (i+1) + "\">\n\t\t<Start>" + move.start
					+ "</Start>\n\t\t<Target>" + move.target + "</Target>\n\t\t<Promotion>"
					+ move.promotion + "</Promotion>\n\t</Move>"
			}
			xml += "\n</ChessGame>";
		}
		var a = document.getElementById("a");
  	var file = new Blob([xml], {type: "text/plain"});
  	window.open(URL.createObjectURL(file));
	}

	publicInterface.editorCustomStart = function(editorFEN) {
		initEngine(editorFEN);

		publicInterface.CANVAS_OFFSET_LEFT = 2 * publicInterface.SQUARE_SIZE;
		var e = elements;
		var width = publicInterface.BOARD_OFFSET_LEFT + (8*publicInterface.SQUARE_SIZE);
		e.container.style.width = width + "px";
		e.boardCanvas.style.width = width;
		publicInterface.CANVAS_OFFSET_LEFT = 0;
		publicInterface.chessboard.create();
		writeControlsHtml();
		disableEditor();
	  publicInterface.refresh();
	}

	publicInterface.playReplay = function() {
		if (replay != null) {
			// initiate engine with start FEN
			this.goToMove(0);
			var div = elements.controls;
			var progressBar = div.getElementsByClassName("progress-replay")[0];
			var replayButton = div.getElementsByClassName("button-replay")[0];
			replayButton.disabled = true;
			// replay moves
			playersOld = players;
			players = ["human", "human"];
			deactivateBoard();
			replay.progress = 0;
			progressBar.value = 0;
			progressBar.max = replay.movelist.length;
			var callback = function(){
				replayButton.disabled = false;
				activateBoard();
				players = playersOld;
				nextMove();
			}.bind(this);
			for (var i = replay.movelist.length-1; i >= 0; i--) {
				var currentMove = replay.movelist[i];
				callback = (function(move, progress, callback) {
					return function() {
						engineInterface.move(move);
						this.refresh();
						replay.progress = progress;
						progressBar.value = progress;
						callback();
					}.bind(this);
				}.bind(this))(currentMove, (i+1), callback);
				callback = (function(move, callback) {
					return function() {
						animateMove(move, callback);
					}.bind(this);
				}.bind(this))(currentMove, callback);
			}
			callback();
		}
	}

	publicInterface.setInteractionMode = function(interactionMode) {
		if (interactionMode >= 1 && interactionMode <= 2) {
			deactivateMoveListener();
			this.interactionMode = interactionMode;
			activateMoveListener();
		}
	}

	publicInterface.setColorControl = function(color, control) {
		if ((color == "white" || color == "black")
		&& (control == "human" || control == "computer")) {
			var id = 0;
			if (color == "black") {
				id = 1;
			}
			players[id] = control;
			nextMove();
		}
	}

	publicInterface.logMove = function(moveString, moveID) {
		var logOut = elements.logging.output;
		// TODO: vernünftige Klasse
		var loggedMove = createNewChild(logOut, "div", "log-move");
		loggedMove.appendChild(document.createTextNode(moveString));
		loggedMove.value = moveID;

		loggedMove.onclick = (function(frontEnd, element) {
			return function() {
				var moveID = this.value;
				frontEnd.goToMove(moveID);
			}.bind(element)
		})(publicInterface, loggedMove);
		// always scroll to bottom to show newest move
		logOut.scrollTop = logOut.scrollHeight;
	}

	publicInterface.goToMove = function(moveID) {
		var logOut = elements.logging.output;
		var child = logOut.lastChild;
		while (child != null && child.value > moveID) {
			logOut.removeChild(logOut.lastChild);
			child = logOut.lastChild;
		}
		engineInterface.goToMove(moveID);
		this.refresh();
	}

  //private Methoden

  // Baut div(s) zusammen
  var initFrontend = function(target) {
    var container;
    if (typeof(target) == "string") {
      container = document.getElementById(target);
    } else if (target.jquery !== undefined) {
      container = target.get(0);
    } else {
      container = target;
    }
    var inner = createNewChild(container, "div", INNER_DIV_CLASS);
    elements.inner = inner;
    elements.container = container;
    elements.boardCanvas = createNewChild(inner, "canvas", BOARD_CANVAS_CLASS);
		elements.logging = createNewChild(container, "div", LOGGING_DIV_CLASS);
		prepareCanvas();
    elements.controls = createNewChild(container, "div", CONTROL_DIV_CLASS);
  };

	var prepareCanvas = function() {
		var canvas = elements.boardCanvas;
	  canvas.drawableObjects = [];
	  canvas.addDrawableObject = function(drawableObject, bottomLayer) {
	    if (!this.drawableObjects.includes(drawableObject)) {
	      if (bottomLayer) {
	        this.drawableObjects.splice(0, 0, drawableObject)
	      } else {
	        this.drawableObjects.push(drawableObject);
	      }
	    }
	  };
	  canvas.removeDrawableObject = function(drawableObject) {
	    var index = this.drawableObjects.indexOf(drawableObject);
	    if (index >= 0) {
	      this.drawableObjects.splice(index, 1);
	    }
	  };
	  canvas.draw = function() {
	    var ctx = this.getContext("2d");
	    ctx.save();
	    ctx.fillStyle = "White";
	    ctx.fillRect(0, 0, this.width, this.height);
	    ctx.restore();
	    for (var i = 0; i < this.drawableObjects.length; i++) {
	      this.drawableObjects[i].draw();
	    }
	  };
	  canvas.interactionListener = {};
	  canvas.interactionListener.startListener = null;
	  canvas.interactionListener.moveListener = null;
	  canvas.interactionListener.targetListener = null;
	  canvas.interactionListener.startEvent = null;
	};

  //Stellt Größe ein. Für das Canvas muss was davon rüber
  var renderElements = function() {
    publicInterface.BOARD_OFFSET_TOP = publicInterface.SQUARE_SIZE*0.8;
    publicInterface.BOARD_OFFSET_LEFT = publicInterface.SQUARE_SIZE*0.8;
    var e = elements;
    var height = publicInterface.BOARD_OFFSET_TOP + (8*publicInterface.SQUARE_SIZE);
    var width = publicInterface.BOARD_OFFSET_LEFT + (8*publicInterface.SQUARE_SIZE);
		e.container.style.width = width + 10 +  "px";
    e.inner.style.height = height + 10 + "px";
		e.inner.style.width = width + 10 + "px";
    e.boardCanvas.height = height;
    e.boardCanvas.width = width;
  };

  var initChessboard = function() {
    var canvas = elements.boardCanvas;
    publicInterface.chessboard = new Chessboard(canvas, publicInterface);
    publicInterface.chessboard.create();
		canvas.addDrawableObject(publicInterface.chessboard, false);
  };

	var writeControlsHtml = function() {
		var e = elements;
		var controlsDiv = e.controls;
		createGameControls(controlsDiv, publicInterface, engineInterface);
		var width = e.inner.style.width;
		controlsDiv.style.width = width;

		var loggingDiv = e.logging;
		loggingDiv.output =  createLoggingControls(loggingDiv);
		var loggingWidth = 120;
		loggingDiv.style.width = loggingWidth + "px";
		loggingDiv.style.height = 300 + "px";
		e.container.style.width =	parseInt(width.substring(0, (width.length-2))) + loggingWidth + "px";
	};

  /* Auto play timeout verzögert die Züge des Computers,
	da sonst bei Comp vs. Comp Spielen die Spiele quasi direkt zuende wären,
	weil es so schnell geht. */
  var nextMove = function()  {
		if (active == true) {
			var nextColor = engineInterface.whosTurn();
			var mover = (nextColor == "black") ? 1 : 0;
			if (players[mover] == "computer") {
				deactivateMoveListener();
			} else {
				activateMoveListener();
			}
			if (players[mover] == "computer" &&
			autoPlayTimeout === undefined) {
				var timeout = (players[1 - mover] == "computer") ? 500: 10;
				autoPlayTimeout = window.setTimeout(function() {
					computerMove()}.bind(this), timeout);
				}
		}
  };

  var computerMove = function() {
    autoPlayTimeout = undefined;
    var move = engineInterface.computerMove();
    var timeout = animateMove(move,
        function(engineInterface, refresh, next) {
          return function() {
            var moveResult = engineInterface.move(move);
						refresh();
						if (moveResult && !engineInterface.isGameOver()) {
							next();
						}
          };
        }(engineInterface, publicInterface.refresh, nextMove));
  };

  //Nur fürs animieren mehrerer moves (auf einmal)
  // var animateMoves = function(moves) {
  //   if (moves != null && moves[0] != null && moves[0].length == 2) {
  //     var callback = function(){this.refresh();}.bind(this);
  //     for (var i = moves.length - 1; i >= 0; i--) {
  //       var callback = (function (index, callback) {
  //         return function() {this.animateMove(moves[index][0], moves[index][1], callback);}.bind(this);
  //       }.bind(this))(i, callback);
  //     }
  //     callback();
  //   }
  // };

  var animateMove = function(move, callback) {
		var start = move.start;
		var target = move.target;
    var canvas = elements.boardCanvas;
		var board = publicInterface.chessboard;
    var fields = board.fields;
    var startField = null;
    var targetField = null;
    var stepsPerField = 50;
    var timePerStep = 10;
    for (var i = 0; i < fields.length; i++) {
      for (var j = 0; j < 8; j++) {
        if (fields[i][j].algebraicID == start) {
          startField = fields[i][j];
        }
        if (fields[i][j].algebraicID == target) {
          targetField = fields[i][j];
        }
      }
    }
    if (startField != null && targetField != null && startField != targetField
      && startField.piece != null) {
      var animatedPiece = startField.piece;
      board.dragging.draggedPiece = animatedPiece;
      var fieldDistanceX = Math.abs(startField.idX - targetField.idX);
      var fieldDistanceY = Math.abs(startField.idY - targetField.idY);
      var stepsX = fieldDistanceX * stepsPerField;
      var stepsY = fieldDistanceY * stepsPerField;
      var totalSteps = Math.max(stepsX, stepsY);
      var canvasDistanceX = Math.abs((startField.posX + (startField.size * 0.1)) - (targetField.posX + (targetField.size * 0.1)));
      var canvasDistanceY = Math.abs((startField.posY + (startField.size * 0.1)) - (targetField.posY + (targetField.size * 0.1)));
      var canvasDistancePerStepX = canvasDistanceX / totalSteps;
      if (startField.posX > targetField.posX) {
        canvasDistancePerStepX = canvasDistancePerStepX * -1;
      }
      var canvasDistancePerStepY = canvasDistanceY / totalSteps;
      if (startField.posY > targetField.posY) {
        canvasDistancePerStepY = canvasDistancePerStepY * -1;
      }
      for (var i = 0; i < totalSteps; i++) {
        window.setTimeout(function() {
          var pieceNewPosX = animatedPiece.posX + canvasDistancePerStepX;
          var pieceNewPosY = animatedPiece.posY + canvasDistancePerStepY;
          animatedPiece.setPosition(pieceNewPosX, pieceNewPosY);
					canvas.draw()
        }, (i+1) * timePerStep);
      }
      window.setTimeout(function() {
        board.dragging.draggedPiece = null;
        if (callback != undefined && callback != null) {
          callback();
        }
      }, (totalSteps * timePerStep) * 1.05);
      return totalSteps * timePerStep;
    }
  };

	var activateMoveListener = function() {
		// Geht auf Nummer sicher, dass nicht auf einmal mehrere Listener gleichzeitig aktiv sind
		deactivateMoveListener();
		var canvas = elements.boardCanvas;
		var interactionListener = canvas.interactionListener;
		if (publicInterface.interactionMode == 1) {
			canvas.interactionListener.startListener = GameStartListenerDown.bind(publicInterface);
			canvas.addEventListener("mousedown", canvas.interactionListener.startListener, false);
		} else if (publicInterface.interactionMode == 2) {
			canvas.interactionListener.startListener = GameStartListenerUp.bind(publicInterface);
			canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
		}
	};

	var deactivateMoveListener = function() {
		var canvas = publicInterface.chessboard.canvas;
		var interactionListener = canvas.interactionListener;
		canvas.removeEventListener("mousedown", interactionListener.startListener, false);
		canvas.removeEventListener("mouseup", interactionListener.startListener, false);
		canvas.removeEventListener("mousemove", interactionListener.moveListener, false);
		canvas.removeEventListener("mouseup", interactionListener.targetListener, false);
		interactionListener.startListener = null;
		interactionListener.moveListener = null;
		interactionListener.targetListener = null;
		interactionListener.startEvent = null;
	};

	var activateBoard = function() {
		active = true;
		activateMoveListener();
		nextMove();
	}

	var deactivateBoard = function() {
		deactivateMoveListener();
		active = false;
	}

	var enableEditor = function() {
		publicInterface.CANVAS_OFFSET_LEFT = 2 * publicInterface.SQUARE_SIZE;
		var e = elements;
		var width = publicInterface.CANVAS_OFFSET_LEFT + publicInterface.BOARD_OFFSET_LEFT + (8*publicInterface.SQUARE_SIZE);
		elements.container.style.width = width + "px";
		e.boardCanvas.width = width;
		publicInterface.chessboard.create();
		publicInterface.chessboard.loadBoard(null);
		deactivateBoard();
		boardEditor = new BoardEditor(e.boardCanvas, publicInterface, elements.controls);
		e.boardCanvas.addDrawableObject(boardEditor, true);
		e.boardCanvas.draw();
	}

	var disableEditor = function() {
		elements.boardCanvas.removeDrawableObject(boardEditor);
		boardEditor = null;
		activateBoard();
	}

	var startFromReplay = function(replayFile) {
		// parse xml file
		replay = parseXMLFile(replayFile);
		replay.progress = 0;
		// create controls
		var div = elements.controls;
		var replayControls = createReplayControls(div, publicInterface);
		initEngine(replay.startFEN);
		publicInterface.playReplay();
	}

	var interpretCustomStart = function(customStart) {
		if (customStart != null && customStart != "") {
			if (checkForXML(customStart)) {
				startFromReplay(customStart);
			} else {
				initEngine(customStart);
			}
		}
	}

	var checkForXML = function(customStart) {
		if (customStart != undefined && customStart != null) {
			var startSplit = customStart.split(".");
			var xmlCheck = startSplit[startSplit.length-1];
			if (xmlCheck == "xml") {
				return true;
			}
		}
		return false;
	}

	var initEngine = function(customStartFEN) {
		// prevent empty boards from loading
		var components = customStartFEN.split(" ");
		if (components != null && components[0] != null && components[0] != "8/8/8/8/8/8/8/8") {
			engineInterface.init(customStartFEN);
		}
	};

  initFrontend(id);
  renderElements();
  initChessboard();

	if (editMode == undefined || editMode == false) {
		writeControlsHtml();
		activateBoard();
		interpretCustomStart(customStart);
		publicInterface.refresh();
	} else if (editMode == true) {
		enableEditor();
	}

  return publicInterface
});
