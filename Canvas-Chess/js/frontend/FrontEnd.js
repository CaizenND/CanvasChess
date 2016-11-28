var FrontEnd = (function(id, argumentString) {

	// public Attribute
	var publicInterface = {
		configuration: null,
		chessboard : {}
	}

	// private Attribute
	var interactionMode = 2;		// Drag & Drop (1), Select & Move (2)

	var replay = null;

	var engineInterface = new EngineInterface(publicInterface);

	var boardEditor = {};

  var elements = {};

  var players = ["human", "human"]; //[white, black] controllers - "human", "computer"

	var	active = true;

  var autoPlayTimeout = undefined;

  // public Methoden
	publicInterface.move = function(move) {
		// log feedback
		if (engineInterface.getFeedback != undefined && publicInterface.configuration.showFeedback) {
			var feedbackLog = elements.feedback;
			var feedback = engineInterface.getFeedback(move);
			while (feedbackLog.firstChild) {
    		feedbackLog.removeChild(feedbackLog.firstChild);
			}
			var feedbackEntry = createNewChild(feedbackLog, "div", "feedback-container");
			feedbackEntry.appendChild(document.createTextNode(feedback));
		}
		// make move
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
    this.chessboard.loadBoard(engineInterface.getBoard());
		// TODO: Animationen mit requestanimationframe?
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
		disableEditor();
		this.chessboard.setup();
		writeControlsHtml();
		initEngine(editorFEN);
	  this.refresh();
		this.activateBoard();
	}

	publicInterface.playReplay = function() {
		if (replay != null) {
			var div = elements.controls;
			var progressBar = div.getElementsByClassName("progress-replay")[0];
			var replayButton = div.getElementsByClassName("button-replay")[0];
			replayButton.disabled = true;
			playersOld = players;
			players = ["human", "human"];
			this.goToMove(0);
			this.deactivateBoard();
			players = playersOld;
			this.refresh();

			// replay moves
			replay.progress = 0;
			progressBar.value = 0;
			progressBar.max = replay.movelist.length;
			var callback = function(){
				replayButton.disabled = false;
				publicInterface.activateBoard();
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

	publicInterface.setInteractionMode = function(mode) {
		if (mode >= 1 && mode <= 2) {
			interactionMode = mode;
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
		if (this.configuration.showLogging) {
			var logOut = elements.logging.output;
			var loggedMove = createNewChild(logOut, "div", "log-move");
			loggedMove.appendChild(document.createTextNode(moveString));
			loggedMove.value = moveID;
			if (this.configuration.allowLoggingInteraction) {
				loggedMove.onclick = (function(frontEnd, element) {
					return function() {
						var moveID = this.value;
						frontEnd.goToMove(moveID);
					}.bind(element)
				})(publicInterface, loggedMove);

			}
			// always scroll to bottom to show newest move
			logOut.scrollTop = logOut.scrollHeight;
		}
	}

	publicInterface.goToMove = function(moveID) {
		if (active == true) {
			if (this.configuration.showLogging) {
				var logOut = elements.logging.output;
				var child = logOut.lastChild;
				while (child != null && child.value > moveID) {
					logOut.removeChild(logOut.lastChild);
					child = logOut.lastChild;
				}
			}
			engineInterface.goToMove(moveID);
			this.refresh();
			nextMove();
		}
	}

	publicInterface.activateBoard = function() {
		active = true;
		activateMoveListener();
	}

	publicInterface.deactivateBoard = function() {
		deactivateMoveListener();
		active = false;
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
    var inner = createNewChild(container, "div", "inner");
    elements.inner = inner;
    elements.container = container;
		elements.container.className = "chess";
    elements.boardCanvas = createNewChild(inner, "canvas", "boardCanvas");
		prepareCanvas();
		elements.logging = createNewChild(container, "div", "logging");
		elements.feedback = createNewChild(container, "div", "feedback");
    elements.controls = createNewChild(container, "div", "controls");
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

	var initChessboard = function() {
    var canvas = elements.boardCanvas;
    publicInterface.chessboard = new Chessboard(canvas);
		canvas.addDrawableObject(publicInterface.chessboard, false);
  };

	var processArgumentString = function() {
		var editor = false;
		var difficulty = null;
		var interaction = null;
		var defaultAI = null;
		var promotion = null;
		var size = null;
		var startFEN = "";

		if (argumentString != undefined && argumentString != null) {
			var argumentList = argumentString.split(";");
			for (var i = 0; i < argumentList.length; i++) {
				var argument = argumentList[i].split(":");
				switch (argument[0]) {
					case "config": argumentConfig(argument[1]); break;
					case "editor": editor = true; break;
					case "difficulty": difficulty = argumentDifficulty(argument[1]); break;
					case "interaction": interaction = argumentInteraction(argument[1]); break;
					case "players": defaultAI = argumentsPlayers(argument[1]); break;
					case "promotion": promotion = argumentPromotion(argument[1]); break;
					case "replay": argumentReplay(argument[1]); break;
					case "size": size = argumemntSize(argument[1]); break;
					case "startFEN": startFEN = argument[1]; break;
					default: break;
				}
			}
		}

		if (publicInterface.configuration == null) {
			publicInterface.configuration = ConfigurationManager.getConfiguration("default");
		}

		var config = publicInterface.configuration;

		if (difficulty != null) {
			config.defaultDifficulty = difficulty;
		}
		engineInterface.setComputerLevel(config.defaultDifficulty);

		if (interaction != null) {
			config.defaultInteractionMode = interaction;
		}
		interactionMode = config.defaultInteractionMode;

		if (promotion != null) {
			config.defaultPawnPromotion = promotion;
		}
		engineInterface.setPawnPromotion(config.defaultPawnPromotion);

		if (size != null) {
			config.size = size;
		}
		publicInterface.chessboard.SQUARE_SIZE = config.size;

		if (editor) {
			config.showEditor = true;
		}

		if (config.showEditor) {
			enableEditor();
		} else {
			if (defaultAI != null) {
				config.defaultAI = defaultAI;
			}
			players = config.defaultAI;
			renderElements();
			writeControlsHtml();
			if (replay != null) {
				startFromReplay();
			} else {
				initEngine(startFEN);
				renderElements();
				publicInterface.refresh();
				nextMove();
			}
		}
	}

	var argumentConfig = function(value) {
		publicInterface.configuration = ConfigurationManager.getConfiguration(value);
	}

	var argumentDifficulty = function(value) {
		var difficulty = parseInt(value);
		if (difficulty >= engineInterface.MIN_COMPUTER_LEVEL && difficulty <= engineInterface.MAX_COMPUTER_LEVEL) {
			return difficulty;
		}
		return null;
	}

	var argumentInteraction = function(value) {
		var mode = parseInt(value);
		if (mode >= 1 && mode <= 2) {
			return mode;
		}
		return null;
	}

	var argumentsPlayers = function(value) {
		var defaultAI = value.split(",");
		if (defaultAI.length == 2 &&
			(defaultAI[0] == "human" || defaultAI[0] == "computer") &&
			(defaultAI[1] == "human" || defaultAI[1] == "computer")) {
			return defaultAI;
		}
		return null;
	}

	var argumentPromotion = function(value) {
		if (engineInterface.PROMOTION_STRINGS.indexOf(value) >= 0
		&& engineInterface.PROMOTION_STRINGS.indexOf(value) <= engineInterface.PROMOTION_STRINGS.length) {
			return value;
		}
		return null;
	}

	var argumentReplay = function(value) {
		if (checkForXML(value)) {
			// parse xml file
			replay = parseXMLFile(value);
		}
	}

	var argumemntSize = function(value) {
		var size = parseInt(value);
		if (size >= 55) {
			return size;
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

	var enableEditor = function() {
		publicInterface.deactivateBoard();
		boardEditor = new BoardEditor(publicInterface, elements.controls);
		renderElements();
		elements.boardCanvas.draw();
	}

	var disableEditor = function() {
		boardEditor = null;
	}

  //Stellt Größe ein. Für das Canvas muss was davon rüber
  var renderElements = function() {
		var board = publicInterface.chessboard;
    board.BOARD_OFFSET_TOP = board.SQUARE_SIZE*0.8;
    board.BOARD_OFFSET_LEFT = board.SQUARE_SIZE*0.8;
		board.setup();
    var e = elements;
    var height = board.BOARD_OFFSET_TOP + board.CANVAS_OFFSET_TOP + (8*board.SQUARE_SIZE);
    var width = board.BOARD_OFFSET_LEFT + board.CANVAS_OFFSET_LEFT + (8*board.SQUARE_SIZE);

		e.container.style.width = width + 10 + "px";
    e.inner.style.height = height + 10 + "px";
		e.inner.style.width = width + 10 + "px";
    e.boardCanvas.height = height;
    e.boardCanvas.width = width;
		e.feedback.style.width = width + "px";
		e.controls.style.width = width + "px";

		if (e.logging.output != undefined) {
			var loggingWidth = 120;
			e.logging.style.width = loggingWidth + "px";
			e.logging.style.height = height + "px";
			e.container.style.width =	width + loggingWidth + 10 + "px";
		}
  };

	var writeControlsHtml = function() {
		var e = elements;
		var controlsDiv = e.controls;
		var loggingDiv = e.logging;
		createGameControls(controlsDiv, publicInterface, engineInterface);
		loggingDiv.output =  createLoggingControls(loggingDiv, publicInterface);
		renderElements();
	};

	var startFromReplay = function() {
		// create controls
		var div = elements.controls;
		var replayControls = createReplayControls(div, publicInterface);
		initEngine(replay.startFEN);
		publicInterface.playReplay();
	}

	var initEngine = function(customStartFEN) {
		// prevent empty boards from loading
		var components = customStartFEN.split(" ");
		if (components[0] != "8/8/8/8/8/8/8/8") {
			engineInterface.init(customStartFEN);
		}
	}

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
			// maybe something happened during findmove
			if (active == true) {
				var timeout = animateMove(move,
					function(engineInterface, frontEnd, next) {
						return function() {
							var moveResult = engineInterface.move(move);
							frontEnd.refresh();
							if (moveResult && !engineInterface.isGameOver()) {
								next();
							}
						};
					}(engineInterface, publicInterface, nextMove));
		}
  };

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
			board.dragging.draggedPiece = startField.piece;
			var fieldDistanceX = Math.abs(startField.idX - targetField.idX);
			var fieldDistanceY = Math.abs(startField.idY - targetField.idY);
			var fieldDistanceXY = Math.sqrt(Math.pow(fieldDistanceX,2)+Math.pow(fieldDistanceY,2));
			var totalSteps = fieldDistanceXY * stepsPerField;
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
				window.setTimeout(
					function(animatedPiece) {
						return function() {
							// check if our animation is still the correct one
							if (board.dragging.draggedPiece == animatedPiece) {
								var pieceNewPosX = board.dragging.draggedPiece.posX + canvasDistancePerStepX;
								var pieceNewPosY = board.dragging.draggedPiece.posY + canvasDistancePerStepY;
								board.dragging.draggedPiece.setPosition(pieceNewPosX, pieceNewPosY);
								canvas.draw();
							}
						};
					}(board.dragging.draggedPiece), (i+1) * timePerStep);
			}
			window.setTimeout(
				function(animatedPiece) {
					return function() {
						if (board.dragging.draggedPiece == animatedPiece) {
							board.dragging.draggedPiece = null;
							if (callback != undefined && callback != null) {
								callback();
							}
						}
					};
				}(board.dragging.draggedPiece), (totalSteps * timePerStep) * 1.05);
				return totalSteps * timePerStep;
		}
	};

	var activateMoveListener = function() {
		// Geht auf Nummer sicher, dass nicht auf einmal mehrere Listener gleichzeitig aktiv sind
		deactivateMoveListener();
		var canvas = elements.boardCanvas;
		var interactionListener = canvas.interactionListener;
		if (interactionMode == 1) {
			canvas.interactionListener.startListener = GameStartListenerDown.bind(publicInterface);
			canvas.addEventListener("mousedown", canvas.interactionListener.startListener, false);
		} else if (interactionMode == 2) {
			canvas.interactionListener.startListener = GameStartListenerUp.bind(publicInterface);
			canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
		}
	}

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

	// Konstruktor
	initFrontend(id);
	initChessboard();
	processArgumentString();

  return publicInterface
});
