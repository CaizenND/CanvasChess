var FrontEnd = (function(id, customState) {

	// public Attribute
	var PublicInterface = {
    SQUARE_SIZE : 40,
    BOARD_OFFSET_TOP : 32,
    BOARD_OFFSET_LEFT : 32,
    interactionStyle : 2,		// Drag & Drop (1), Click - Move - Click (2)
    chessboard : null
	}

	// private Attribute
  var CUSTOM_STATE = null;

	var ENGINE_INTERFACE = new EngineInterface();

	var INNER_DIV = 'inner';

  var BOARD_CANVAS = 'boardCanvas';

  var CONTROL_DIV = 'controls';

  var DEFAULT_COMPUTER_LEVEL = 2; // 0 - 4

  var PROMOTION_STRINGS = ['queen', 'rook', 'knight', 'bishop'];

  var CONTROLS = [
    { //Promotion
      onclick_wrap: function(e) {
          var x = (ENGINE_INTERFACE.getPawnPromotion() + 1) % ENGINE_INTERFACE.PROMOTION_INTS.length;
          ENGINE_INTERFACE.setPawnPromotion(x);
          var eventTarget = (e.currentTarget) ? e.currentTarget : e.srcElement;
          eventTarget.innerHTML = 'pawn promotes to <b>' + PROMOTION_STRINGS[x] + '</b><br>';
      },
      refresh: function(el) {
          el.innerHTML = 'pawn promotes to <b>' + PROMOTION_STRINGS[ENGINE_INTERFACE.getPawnPromotion()] + '</b><br>';
      }
    },
    { //Interaction Style
      onclick_wrap: function(e) {
          var canvas = PublicInterface.chessboard.canvas;
          var interactionListener = canvas.interactionListener;
          canvas.removeEventListener("mousedown", interactionListener.startListener, false);
          canvas.removeEventListener("mouseup", interactionListener.startListener, false);
          canvas.removeEventListener("mousemove", interactionListener.moveListener, false);
          canvas.removeEventListener("mouseup", interactionListener.targetListener, false);

          if(PublicInterface.interactionStyle == 2) {
            PublicInterface.interactionStyle = 1;
            canvas.interactionListener.startListener = mouseDownListenerStart.bind(PublicInterface);
            canvas.addEventListener("mousedown", canvas.interactionListener.startListener, false);
          } else {
            PublicInterface.interactionStyle = 2;
            canvas.interactionListener.startListener = mouseUpListenerStart.bind(PublicInterface);
            canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
          }

          var eventTarget = (e.currentTarget) ? e.currentTarget : e.srcElement;
          eventTarget.innerHTML = 'Interaction Style <b>' + PublicInterface.interactionStyle + '</b>';
      },
      refresh: function(el) {
          el.innerHTML = 'Interaction Style <b>' + PublicInterface.interactionStyle + '</b>';
      }
    }
  ];

  var elements = null;

  var players = [];

  var computer_level = DEFAULT_COMPUTER_LEVEL;

  var buttons = {
    elements: [],
    refreshers: []
  };

  var autoPlayTimeout = undefined;

  // public Methoden
	PublicInterface.move = function(start, end) {
    var moveResult = ENGINE_INTERFACE.move(start, end, ENGINE_INTERFACE.PROMOTION_INTS);
    if (moveResult && !ENGINE_INTERFACE.isGameOver()) {
      this.nextMove_timeout = window.setTimeout(
        function(next) {
          return function() {
            next();
          };
        }(nextMove), 1);
    }
    return moveResult;
  };

  PublicInterface.refresh = function() {
    PublicInterface.chessboard.loadBoard(ENGINE_INTERFACE.getBoard());
    refreshButtons();
  };

  //private Methoden

  //Baut div(s) zusammen
  var initFrontendAndEngine = function(target) {
    var container;
    if (typeof(target) == 'string') {
      container = document.getElementById(target);
    } else if (target.jquery !== undefined) {
      container = target.get(0);
    } else {
      container = target;
    }
    var inner = createNewChild(container, "div", INNER_DIV);
    elements = {};
    elements.inner = inner;
    elements.container = container;
    var board = elements.boardCanvas = createNewChild(inner, "canvas", BOARD_CANVAS);
    elements.controls = createNewChild(container, "div", CONTROL_DIV);

    if (CUSTOM_STATE != null) {
      ENGINE_INTERFACE.init(CUSTOM_STATE);
    } else {
      ENGINE_INTERFACE.init("");
    }

    players = ['human', 'computer']; //[white, black] controllers - 'human','computer'
  };

  //Stellt Größe ein. Für das Canvas muss was davon rüber
  var renderElements = function() {
    PublicInterface.BOARD_OFFSET_TOP = PublicInterface.SQUARE_SIZE*0.8;
    PublicInterface.BOARD_OFFSET_LEFT = PublicInterface.SQUARE_SIZE*0.8;
    var e = elements;
    var height = PublicInterface.BOARD_OFFSET_TOP + (8*PublicInterface.SQUARE_SIZE);
    var width = PublicInterface.BOARD_OFFSET_LEFT + (8*PublicInterface.SQUARE_SIZE);
    var style_height = height + 'px';
    var style_width = width + 'px';
    e.inner.style.height = style_height;
    e.boardCanvas.height = height;
    e.boardCanvas.width = width;
  };

  var initChessboard = function() {
    var canvas = elements.boardCanvas;
    PublicInterface.chessboard = new Chessboard(canvas, PublicInterface);
    PublicInterface.chessboard.create();
    canvas.interactionListener = {};
    canvas.interactionListener.startListener = null;
    canvas.interactionListener.moveListenerListener = null;
    canvas.interactionListener.targetListener = null;
    if (PublicInterface.interactionStyle == 1) {
      canvas.interactionListener.startListener = mouseDownListenerStart.bind(PublicInterface);
      canvas.addEventListener("mousedown", canvas.interactionListener.startListener, false);
    } else if (PublicInterface.interactionStyle == 2) {
      canvas.interactionListener.startListener = mouseUpListenerStart.bind(PublicInterface);
      canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
    }
  };

  var writeControlsHtml = function(lut) {
    var div = elements.controls;
    for (var i = 0; i < lut.length; i++) {
      var o = lut[i];
      var span = createNewChild(div, "span");
      span.className = 'controlButton';
      buttons.elements.push(span);

      addEventListenerIE6Compatibility(span, "click",
      o.onclick_wrap);

      if (o.refresh) {
        buttons.refreshers.push([o.refresh, span]);
      }
    }
    refreshButtons();
  };

  var refreshButtons = function() {
    var rf = buttons.refreshers;
    for (var i = 0; i < rf.length; i++) {
      var x = rf[i];
      x[0].call(this, x[1]);
    }
  };

  var createNewChild = function(element, childtag, className) {
    var child = document.createElement(childtag);
    element.appendChild(child);
    if (className !== undefined) {
      child.className = className;
    }
    return child;
  };

  /* Auto play timeout verzögert die Züge des Computers,
	da sonst bei Comp vs. Comp Spielen die Spiele quasi direkt zuende wären,
	weil es so schnell geht. */
  var nextMove = function()  {
    var nextColor = ENGINE_INTERFACE.whosTurn();
    var mover = (nextColor == "black") ? 1 : 0;
    if (players[mover] == 'computer' &&
    autoPlayTimeout === undefined) {
      var timeout = (players[1 - mover] == 'computer') ? 500: 10;
  	  autoPlayTimeout = window.setTimeout(function() {
        computerMove()}.bind(this), timeout);
    }
  };

  var computerMove = function() {
    autoPlayTimeout = undefined;
    var move = ENGINE_INTERFACE.computerMove();
    var timeout = animateMove(move.start, move.target,
        function(refresh, engineInterface) {
          return function() {
            engineInterface.move(move.start, move.target);
            refresh();
          };
        }(PublicInterface.refresh, ENGINE_INTERFACE));
  };

  //Nur fürs animieren mehrerer moves (auf einmal)
  var animateMoves = function(moves) {
    if (moves != null && moves[0] != null && moves[0].length == 2) {
      var callback = function(){this.refresh();}.bind(this);
      for (var i = moves.length - 1; i >= 0; i--) {
        var callback = (function (index, callback) {
          return function() {this.animateMove(moves[index][0], moves[index][1], callback);}.bind(this);
        }.bind(this))(i, callback);
      }
      callback();
    }
  };

  var animateMove = function(start, target, callback) {
    var canvas = elements.boardCanvas;
    var fields = PublicInterface.chessboard.fields;
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
      canvas.draggedPiece = animatedPiece;
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
          PublicInterface.chessboard.draw();
        }, (i+1) * timePerStep);
      }
      window.setTimeout(function() {
        canvas.draggedPiece = null;
        if (callback != undefined && callback != null) {
          callback();
        }
      }, (totalSteps * timePerStep) * 1.05);
      return totalSteps * timePerStep;
    }
  };

  /* MSIE 6 compatibility functions */
  var addEventListenerIE6Compatibility = function (el, eventname, fn) {
    if (el.addEventListener === undefined) {
      el.attachEvent('on' + eventname, fn);
    } else {
      el.addEventListener(eventname, fn);
    }
  };

  initFrontendAndEngine(id);
  renderElements();
  initChessboard();
  writeControlsHtml(CONTROLS);
  PublicInterface.refresh();

  return PublicInterface
});
