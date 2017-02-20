
/**
 * Constructor
 * Module design pattern
 * Creates a frontend object, which is responsible for handling user interaction
 * and calling the engine.
 * @param	id								ID of the DIV node in which the frontend should be created
 * @param argumentString		String containing configuration parameters for the frontend
 */
var FrontEnd = (function(id, argumentString) {

	// public attributes
	var publicInterface = {
		chessboard: new Chessboard(),
		canvas: {},
		boardEditor: {}
	}

	// private attributes
	var configuration = null;

	var interactionMode = 2;		// No interaction (0), Drag & Drop (1), Select & Move (2)

	var replay = null;

	var engineInterface = new EngineInterface(publicInterface);

  var elements = {};

  var players = ["human", "human"]; //[white, black] controllers - "human", "computer"

	var	active = true;

	// Delays computer moves to slow down computer vs. computer games
  var autoPlayTimeout = undefined;


  // public methods

	/**
	 * Tries to execute a move by calling the engine and displays feedback if the
	 * engine support the generation of feedback.
	 * @param move		{start-field, target-field, promotion}
	 * @return true, if move was successfull / false, if move was not successfull
	 */
	publicInterface.move = function(move) {
		// log feedback
		if (engineInterface.getFeedback != undefined && configuration.showFeedback) {
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
		if (moveResult.ok) {
			publicInterface.logMove(moveResult.string, moveResult.moveNumber);
		}
    if (moveResult.ok && !engineInterface.isGameOver()) {
      this.nextMove_timeout = window.setTimeout(
        function(next) {
          return function() {
            next();
          };
        }(nextMove), 1);
    }
    return moveResult;
  };

	/**
	 * Reloads the boardstate from the engine into the chessboard and triggers a
	 * redraw of the canvas.
	 */
  publicInterface.refresh = function() {
    publicInterface.chessboard.loadBoard(engineInterface.getBoard(), publicInterface.canvas);
		publicInterface.canvas.draw();
  };

	/**
	 * Opens a new tab in which the current game (starting position in FEN-notation
	 * and each move) is displayed in an xml-format that can later be imported.
	 * @return true, if move was successfull / false, if move was not successfull

	 */
	publicInterface.exportGameToXML = function() {
		var fen = engineInterface.getStartFEN();
		if (fen != null) {
			var xml = "<chessgame>\n\t<startingposition>" + fen + "</startingposition>";
			var history = engineInterface.getMoveHistory();
			for (var i = 0; i < history.length; i++) {
				var move = history[i];
				xml += "\n\t<move id=\"" + (i+1) + "\">\n\t\t<start>" + move.start
					+ "</start>\n\t\t<target>" + move.target + "</target>\n\t\t<promotion>"
					+ move.promotion + "</promotion>\n\t</move>"
			}
			xml += "\n</chessgame>";
		}
		var a = document.getElementById("a");
  	var file = new Blob([xml], {type: "text/plain"});
  	window.open(URL.createObjectURL(file));
	};

	/**
	 * Generates a String which contains all moves of the current game seperated
	 * by a ".".
	 * @return String, containing all moves
	 */
	publicInterface.exportGameToString = function() {
		var fen = engineInterface.getStartFEN();
		var gameString = "";
		if (fen != null) {
			gameString = fen;
			var history = engineInterface.getMoveHistory();
			for (var i = 0; i < history.length; i++) {
				var move = history[i];
				gameString += "." + move.start + move.target + move.promotion;
			}
		}
		return gameString;
	};

	/**
	 * Automatically replays a game, that was imported via an xml file.
	 */
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
						var moveResult = engineInterface.move(move);
						if (moveResult.ok) {
							publicInterface.logMove(moveResult.string, moveResult.moveNumber);
						}
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
	};

	/**
	 * Changes the interaction mode for the chessboad.
	 * @param mode		Interaction mode that should be used (1 / 2)
	 */
	publicInterface.setInteractionMode = function(mode) {
		if (mode >= 1 && mode <= 2) {
			interactionMode = mode;
			activateMoveListener();
		}
	};

	/**
	 * Changes the control for a given color between player and AI.
	 * @param color			New controller for the color (human / computer)
	 * @param control		Color for which the control should be changed
	 */
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
	};

	/**
	 * Logs a move in the logging area.
	 * @param moveString		String that should be displayed in the logging area
 	 * @param moveID				ID of the move (total number of halfmoves)
	 */
	publicInterface.logMove = function(moveString, moveID) {
		if (configuration.showLogging) {
			var logOut = elements.logging.output;
			var loggedMove = createNewChild(logOut, "div", "log-move");
			loggedMove.appendChild(document.createTextNode(moveString));
			loggedMove.value = moveID;
			if (configuration.allowLoggingInteraction) {
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
	};

	/**
	 * Returns to an earlier move in the game.
	 * @param moveID		ID of the move to which the game should return
	 */
	publicInterface.goToMove = function(moveID) {
		if (active == true) {
			if (configuration.showLogging) {
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
	};

	/**
	 * Activates the board for user and engine interaction.
	 * Activates the mouse listeners.
	 */
	publicInterface.activateBoard = function() {
		active = true;
		activateMoveListener();
	};

	/**
	* Deactivates the board for user and engine interaction.
	* Deactivates the mouse listeners.
	 */
	publicInterface.deactivateBoard = function() {
		deactivateMoveListener();
		active = false;
	};


  //private methods

	/**
	 * Builds the major DIV elements forming the frontend.
	 * @param target		DIV element where the frontend should be build in
	 */
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
    publicInterface.canvas = createNewChild(inner, "canvas", "canvas");
		prepareCanvas();
		publicInterface.canvas.addDrawableObject(publicInterface.chessboard, false);
		elements.logging = createNewChild(container, "div", "logging");
		elements.feedback = createNewChild(container, "div", "feedback");
    elements.controls = createNewChild(container, "div", "controls");
  };

	/**
	 * Sets up the canvas element by adding basic attributes and functions to
	 * manage drawable objects itself as well as adding attributes to manage the
	 * mouselisteners.
	 */
	var prepareCanvas = function() {
		var canvas = publicInterface.canvas;
	  makeCanvasDrawable(canvas);
	  canvas.interactionListener = {};
	  canvas.interactionListener.startListener = null;
	  canvas.interactionListener.moveListener = null;
	  canvas.interactionListener.targetListener = null;
	  canvas.interactionListener.startEvent = null;
	};

	/**
	 * Processes the String of arguments to import and configure the configuration
	 * objects.
	 */
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
					case "replayString": argumentReplayString(argument[1]); break
					case "size": size = argumemntSize(argument[1]); break;
					case "startFEN": startFEN = argument[1]; break;
					default: break;
				}
			}
		}

		if (configuration == null) {
			configuration = ConfigurationManager.getConfiguration("default");
		}

		var config = configuration;

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
	};

	/**
	 * Processes the "config" argument.
	 * @param value		Value of the "config" argument
	 */
	var argumentConfig = function(value) {
		configuration = ConfigurationManager.getConfiguration(value);
	};

	/**
	 * Processes the "difficulty" argument.
	 * @param value		Value of the "difficulty" argument
	 * @return Integer containing difficulty or null if difficulty not wthin boundaries
	 */
	var argumentDifficulty = function(value) {
		var difficulty = parseInt(value);
		if (difficulty >= engineInterface.MIN_COMPUTER_LEVEL && difficulty <= engineInterface.MAX_COMPUTER_LEVEL) {
			return difficulty;
		}
		return null;
	};

	/**
	 * Processes the "interaction" argument.
	 * @param value		Value of the "interaction" argument
	 * @return Integer containing interaction mode or null if interaction mode not wthin boundaries
	 */
	var argumentInteraction = function(value) {
		var mode = parseInt(value);
		if (mode >= 0 && mode <= 2) {
			return mode;
		}
		return null;
	};

	/**
	 * Processes the "players" argument.
	 * @param value		Value of the "players" argument
	 * @return String containing default players (human / computer) or null if wrong format
	 */
	var argumentsPlayers = function(value) {
		var defaultAI = value.split(",");
		if (defaultAI.length == 2 &&
			(defaultAI[0] == "human" || defaultAI[0] == "computer") &&
			(defaultAI[1] == "human" || defaultAI[1] == "computer")) {
			return defaultAI;
		}
		return null;
	};

	/**
	 * Processes the "promotion" argument.
	 * @param value		Value of the "promotion" argument
	 * @return String containing the pawn promotion or null if illegal piece
	 */
	var argumentPromotion = function(value) {
		if (engineInterface.PROMOTION_STRINGS.indexOf(value) >= 0
		&& engineInterface.PROMOTION_STRINGS.indexOf(value) <= engineInterface.PROMOTION_STRINGS.length) {
			return value;
		}
		return null;
	};

	/**
	 * Processes the "replay" argument by importing an xml file.
	 * @param value		Value of the "replay" argument
	 */
	var argumentReplay = function(value) {
		if (checkForXML(value)) {
			// parse xml file
			replay = parseXMLFile(value);
		}
	};

	/**
	 * Processes the "replayString" argument by creating a replay for the passed value.
	 * @param value		Value of the "replayString" argument
	 */
	var argumentReplayString = function(value) {
		var chessGame = value.split(".");
		var startFEN = chessGame[0];
		var movelist = [];
		for (var i = 1; i < chessGame.length; i++) {
			var moveString = chessGame[i];
			var move = {
				start: moveString.substring(0, 2),
				target: moveString.substring(2, 4),
				promotion: moveString.substring(4)
			};
			movelist.push(move);
		}
		replay = {
			startFEN: startFEN,
	    movelist: movelist
		}
	};

	/**
	 * Processes the "size" argument.
	 * @param value		Value of the "size" argument
	 * @return Integer containing size or null if size not wthin boundaries
	 */
	var argumemntSize = function(value) {
		var size = parseInt(value);
		if (size >= 55) {
			return size;
		}
		return null;
	};

	/**
	 * Checks whether a given String can be a path to an xml file.
	 * @param customStart		String that should be checked
	 * @return true if string can be path to xml file, false if not
	 */
	var checkForXML = function(customStart) {
		if (customStart != undefined && customStart != null) {
			var startSplit = customStart.split(".");
			var xmlCheck = startSplit[startSplit.length-1];
			if (xmlCheck == "xml") {
				return true;
			}
		}
		return false;
	};

	/**
	 * Enables the board editor.
	 * Deactivates the boatd interaction, creates the editor object, resizes the
	 * frontend, redraws the canvas and creates a mouse listener for the Editor
	 * interaction.
	 */
	var enableEditor = function() {
		var canvas = publicInterface.canvas;
		publicInterface.deactivateBoard();
		publicInterface.boardEditor = new BoardEditor(editorCustomStart, elements.controls, publicInterface.chessboard, canvas);
		canvas.addDrawableObject(publicInterface.boardEditor, true);
		renderElements();
		canvas.draw();
		// mouse Listener
		canvas.interactionListener.startListener = EditorStartListener.bind(publicInterface);
		canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
	};

	/**
	 * Sets up the frontend for a game after the editor was used.
	 * @param editorFEN		FEN-string that should be loaded as the starting board state
	 */
	var editorCustomStart = function(editorFEN) {
		disableEditor();
		var fen = publicInterface.chessboard.getPiecePlacementFEN() + editorFEN;
		publicInterface.chessboard.CANVAS_OFFSET_LEFT = 0;
		publicInterface.chessboard.setup();
		writeControlsHtml();
		initEngine(fen);
		publicInterface.refresh();
		publicInterface.activateBoard();
	};

	/**
	 * Disables the board Editor and its mouse listerns.
	 */
	var disableEditor = function() {
		var canvas = publicInterface.canvas;
		canvas.removeDrawableObject(publicInterface.boardEditor);
		publicInterface.boardEditor = null;
		var interactionListener = canvas.interactionListener;
		canvas.removeEventListener("mouseup", interactionListener.startListener, false);
		canvas.removeEventListener("mousemove", interactionListener.moveListener, false);
		canvas.removeEventListener("mouseup", interactionListener.targetListener, false);
	};

	/**
	 * Resizes the major frontend elements based on the sizes defined in the chessboard
	 */
  var renderElements = function() {
		var chessboard = publicInterface.chessboard;
		var canvas = publicInterface.canvas;
    chessboard.BOARD_OFFSET_TOP = chessboard.SQUARE_SIZE*0.8;
    chessboard.BOARD_OFFSET_LEFT = chessboard.SQUARE_SIZE*0.8;
		chessboard.setup();
    var e = elements;
    var height = chessboard.BOARD_OFFSET_TOP + chessboard.CANVAS_OFFSET_TOP + (8*chessboard.SQUARE_SIZE);
    var width = chessboard.BOARD_OFFSET_LEFT + chessboard.CANVAS_OFFSET_LEFT + (8*chessboard.SQUARE_SIZE);

		e.container.style.width = width + 10 + "px";
    e.inner.style.height = height + 10 + "px";
		e.inner.style.width = width + 10 + "px";
    canvas.height = height;
    canvas.width = width;
		e.feedback.style.width = width + "px";
		e.controls.style.width = width + "px";

		if (e.logging.output != undefined) {
			var loggingWidth = 120;
			e.logging.style.width = loggingWidth + "px";
			e.logging.style.height = height + "px";
			e.container.style.width =	width + loggingWidth + 10 + "px";
		}
  };

	/**
	 * Creates the game and logging controls for the frontend and resizes it.
	 */
	var writeControlsHtml = function() {
		var e = elements;
		var controlsDiv = e.controls;
		var loggingDiv = e.logging;
		createGameControls(controlsDiv, publicInterface, engineInterface, configuration);
		loggingDiv.output = createLoggingControls(loggingDiv, publicInterface, configuration);
		renderElements();
	};

	/**
	 * Creates the replay controls and import the starting board state of the
	 * replay into the engine.
	 */
	var startFromReplay = function() {
		var div = elements.controls;
		var replayControls = createReplayControls(div, publicInterface);
		initEngine(replay.startFEN);
		publicInterface.playReplay();
	};

	/**
	 * Imports a board state in FEN-notation into the engine.
	 * @param customStartFEN		FEN-string that should be imported
	 */
	var initEngine = function(customStartFEN) {
		// prevent empty boards from loading
		var components = customStartFEN.split(" ");
		if (components[0] != "8/8/8/8/8/8/8/8") {
			engineInterface.init(customStartFEN);
		}
	};

	/**
	 * Checks which color is to move.
	 * Triggers the computer to make a move if it is its turn.
	 */
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

	/**
	 * Lets the engine calculate the best move and lets the engine perform it.
	 */
  var computerMove = function() {
    autoPlayTimeout = undefined;
		var move = engineInterface.computerMove();
		// maybe something happened during findmove
		if (active == true) {
			animateMove(move,
				function(engineInterface, frontEnd, next) {
					return function() {
						var moveResult = engineInterface.move(move);
						if (moveResult.ok) {
							publicInterface.logMove(moveResult.string, moveResult.moveNumber);
						}
						this
						frontEnd.refresh();
						if (moveResult.ok && !engineInterface.isGameOver()) {
							next();
						}
					};
				}(engineInterface, publicInterface, nextMove));
		}
  };

	/**
	 * Animates a move on the canvas / chessboard.
	 * @param move				{start-field, target-field, promotion (can be null)}
	 * @param callback		function that should be called after the animation is complete
	 * @return Integer containing the total time needed for the animation in milliseconds
	 */
	var animateMove = function(move, callback) {
		var start = move.start;
		var target = move.target;
		var chessboard = publicInterface.chessboard;
		var fields = chessboard.fields;
		var startField = null;
		var targetField = null;
		var stepsPerField = 50;
		var timePerStep = 10;
		for (var i = 0; i < fields.length; i++) {
			for (var j = 0; j < 8; j++) {
				if (fields[i][j].textualID == start) {
					startField = fields[i][j];
				}
				if (fields[i][j].textualID == target) {
					targetField = fields[i][j];
				}
			}
		}
		if (startField != null && targetField != null && startField != targetField
			&& startField.piece != null) {
			chessboard.dragging.draggedPiece = startField.piece;
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
							if (chessboard.dragging.draggedPiece == animatedPiece) {
								var pieceNewPosX = chessboard.dragging.draggedPiece.posX + canvasDistancePerStepX;
								var pieceNewPosY = chessboard.dragging.draggedPiece.posY + canvasDistancePerStepY;
								chessboard.dragging.draggedPiece.setPosition(pieceNewPosX, pieceNewPosY);
								publicInterface.canvas.draw();
							}
						};
					}(chessboard.dragging.draggedPiece), (i+1) * timePerStep);
			}
			window.setTimeout(
				function(animatedPiece) {
					return function() {
						if (chessboard.dragging.draggedPiece == animatedPiece) {
							chessboard.dragging.draggedPiece = null;
							if (callback != undefined && callback != null) {
								callback();
							}
						}
					};
				}(chessboard.dragging.draggedPiece), (totalSteps * timePerStep) * 1.05);
				return totalSteps * timePerStep;
		}
	};

	/**
	 * Activates the mouselisteners for the current interaction mode.
	 */
	var activateMoveListener = function() {
		// Geht auf Nummer sicher, dass nicht auf einmal mehrere Listener gleichzeitig aktiv sind
		deactivateMoveListener();
		var canvas = publicInterface.canvas;
		var interactionListener = canvas.interactionListener;
		if (interactionMode == 1) {
			canvas.interactionListener.startListener = GameStartListenerDown.bind(publicInterface);
			canvas.addEventListener("mousedown", canvas.interactionListener.startListener, false);
		} else if (interactionMode == 2) {
			canvas.interactionListener.startListener = GameStartListenerUp.bind(publicInterface);
			canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
		}
	};

	/**
	 * Deactivates the mouselisteners.
	 */
	var deactivateMoveListener = function() {
		var canvas = publicInterface.canvas;
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

	// Constructor
	initFrontend(id);
	processArgumentString();

  return publicInterface
});
