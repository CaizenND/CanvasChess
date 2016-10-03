//TODO: Promotion Control wieder einfügen
//TODO: Aufteilen in Front End, Chessboard und Listener + Benennung anpassen

// Übernommen
var P4WN_SQUARE_HEIGHT = 40;
var P4WN_SQUARE_WIDTH = P4WN_SQUARE_HEIGHT;

var P4WN_CUSTOM_START = null;

// Muss keine Konstante sein (Wo ABC/1,2,3 steht wie breit das sein soll)
var P4WN_BOARD_OFFSET_TOP = P4WN_SQUARE_HEIGHT*0.8;
var P4WN_BOARD_OFFSET_LEFT = P4WN_SQUARE_WIDTH*0.8;

//Klicken und zeihen oder einmal klicken und dann nochmal klicken zum absetzen
var P4WN_INTERACTION_STYLE = 2;

//Ka was mit den Klassen ist muss man an den stellen gucken
var P4WN_WRAPPER_CLASS = 'p4wn-wrapper';
var P4WN_BOARD_CLASS = 'p4wn-board';

//Sind nur 0,1,2,3,4 muss man vllt nicht als Var übernehmen
var P4WN_LEVELS = ['stupid', 'middling', 'default', 'slow', 'slowest'];
var P4WN_DEFAULT_LEVEL = 2;

var P4WN_PROMOTION_STRINGS = ['queen', 'rook', 'knight', 'bishop'];
var P4WN_PROMOTION_INTS = [P4_QUEEN, P4_ROOK, P4_KNIGHT, P4_BISHOP];

//??
var P4WN_IMAGE_DIR = 'img';

var _p4d_proto = {};
var engineInterface = new EngineInterface();

P4wn_display.prototype = _p4d_proto;

//Stellt Größe ein. Für das Canvas muss was davon rüber
_p4d_proto.render_elements = function() {
  var e = this.elements;
  var height = P4WN_BOARD_OFFSET_TOP + (8*P4WN_SQUARE_HEIGHT);
  var width = P4WN_BOARD_OFFSET_LEFT + (8*P4WN_SQUARE_WIDTH);
  var style_height = height + 'px';
  var style_width = width + 'px';
  e.inner.style.height = style_height;
  e.boardCanvas.height = height;
  e.boardCanvas.width = width;
};

function Chessboard(canvas) {
  this.canvas = canvas;
  this.fields = [];
  this.pieces = [];
  // Weiß oben oder unten?
  this.orientation = 0;
}

Chessboard.prototype.create = function() {
  this.fields = new Array(8);
  for (var i = 0; i < 8; i++) {
    this.fields[i] = new Array();
  }
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var field = new Field(this.canvas);
      this.fields[i].push(field);
      var fieldID = this.getLetterOfID(j+1) + (i+1);
      field.setBoardID(fieldID);
      field.setID(j+1, i+1);
      field.setPosition(P4WN_BOARD_OFFSET_LEFT+(j*P4WN_SQUARE_WIDTH),
        P4WN_BOARD_OFFSET_TOP+((7-i)*P4WN_SQUARE_HEIGHT));
      if ((i+j)%2 == 1) {
        field.setColor("BurlyWood");
      } else {
        field.setColor("Ivory");
      }
    }
  }
  this.draw();
};

Chessboard.prototype.getLetterOfID = function(id) {
  var letter = "";
  switch (id) {
    case 1: letter = "a"; break;
    case 2: letter = "b"; break;
    case 3: letter = "c"; break;
    case 4: letter = "d"; break;
    case 5: letter = "e"; break;
    case 6: letter = "f"; break;
    case 7: letter = "g"; break;
    case 8: letter = "h"; break;
    default: letter = ""; break;
  }
  return letter;
};

Chessboard.prototype.switchPositions = function(orientation) {
  this.orientation = orientation;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var currentField = this.fields[i][j];
      if (this.orientation == 0) {
        currentField.setPosition(P4WN_BOARD_OFFSET_LEFT+(j*P4WN_SQUARE_WIDTH),
        P4WN_BOARD_OFFSET_TOP+((7-i)*P4WN_SQUARE_HEIGHT));
      } else {
        currentField.setPosition(P4WN_BOARD_OFFSET_LEFT+(j*P4WN_SQUARE_WIDTH),
        P4WN_BOARD_OFFSET_TOP+(i*P4WN_SQUARE_HEIGHT));
      }
    }
  }
};

Chessboard.prototype.draw = function() {
  var ctx = this.canvas.getContext("2d");
  ctx.save();
  ctx.fillStyle = "White";
  ctx.fillRect(0, 0, 40+8*60, 40+8*60);
  ctx.fillStyle = "Black";
  var fontSize = Math.min(P4WN_SQUARE_HEIGHT*0.5, P4WN_BOARD_OFFSET_TOP*0.8);
  ctx.font = fontSize + "px Arial";
  ctx.textBaseline = "top";
  var text = "";
  var textPaddingTop = 0;
  var textPaddingLeft = 0;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      if (i == 0) {
        text = this.getLetterOfID(j+1);
        textPaddingTop = (P4WN_BOARD_OFFSET_TOP-fontSize)*0.5;
        textPaddingLeft = (P4WN_SQUARE_WIDTH-ctx.measureText(text).width)*0.5;
        ctx.fillText(text,
          P4WN_BOARD_OFFSET_LEFT+(j*P4WN_SQUARE_WIDTH)+textPaddingLeft,
          textPaddingTop);
      }
      if (j == 0) {
        if (this.orientation == 0) {
          text = 8-i;
        } else {
          text = i+1;
        }
        textPaddingTop = (P4WN_SQUARE_HEIGHT-fontSize)*0.5;
        textPaddingLeft = (P4WN_BOARD_OFFSET_LEFT-ctx.measureText(text).width)*0.5;
        ctx.fillText(text, textPaddingLeft,
          P4WN_BOARD_OFFSET_TOP+(i*P4WN_SQUARE_HEIGHT)+textPaddingTop);
      }
      this.fields[i][j].draw();
    }
  }
  ctx.restore();
  for (var i = 0; i < this.pieces.length; i++) {
    if (this.pieces[i] != this.canvas.draggedPiece) {
      this.pieces[i].draw();
    }
  }
  if (this.canvas.draggedPiece != null) {
    this.canvas.draggedPiece.draw();
  }
};

Chessboard.prototype.loadBoard = function(board_state) {
  /*
  // Prevent deleted pieces from loading their images and drawing to the canvas
  for (var i = 0; i < this.pieces.length; i++) {
    this.pieces[i].image.onload = null;
  }
  */

  this.pieces = new Array();
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      this.fields[i][j].setPiece(null);
      //var index = 20 + (i*10) + (j+1);
      var currentPiece = null;
      switch (board_state[i][j]) {
        case 2: currentPiece = new Piece("white", "pawn", this.canvas); break;
        case 3: currentPiece = new Piece("black", "pawn", this.canvas); break;
        case 4: currentPiece = new Piece("white", "rook", this.canvas); break;
        case 5: currentPiece = new Piece("black", "rook", this.canvas); break;
        case 6: currentPiece = new Piece("white", "knight", this.canvas); break;
        case 7: currentPiece = new Piece("black", "knight", this.canvas); break;
        case 8: currentPiece = new Piece("white", "bishop", this.canvas); break;
        case 9: currentPiece = new Piece("black", "bishop", this.canvas); break;
        case 10: currentPiece = new Piece("white", "king", this.canvas); break;
        case 11: currentPiece = new Piece("black", "king", this.canvas); break;
        case 12: currentPiece = new Piece("white", "queen", this.canvas); break;
        case 13: currentPiece = new Piece("black", "queen", this.canvas); break;
        default: break;
      }
      if (currentPiece != null) {
        this.pieces.push(currentPiece);
        currentPiece.loadImage();
        this.fields[i][j].setPiece(currentPiece);
      }
    }
  }
  this.draw();
};

//TODO: CustomStart hier als Parameter übergeben anstatt in eigener Methode (unten)
//Baut div(s) zusammen
function P4wn_display(target) {
  if (! this instanceof P4wn_display) {
    return new P4wn_display(target);
  }
  var container;
  if (typeof(target) == 'string') {
    container = document.getElementById(target);
  } else if (target.jquery !== undefined) {
    container = target.get(0);
  } else {
    container = target;
  }
  var inner = p4d_new_child(container, "div", P4WN_WRAPPER_CLASS);
  this.elements = {};
  this.elements.inner = inner;
  this.elements.container = container;
  var board = this.elements.boardCanvas = p4d_new_child(inner, "canvas", P4WN_BOARD_CLASS);

  this.start = 0;
  this.draw_offers = 0;

  engineInterface.init("");

  this.players = ['human', 'computer']; //[white, black] controllers
  this.pawn_becomes = 0; //index into P4WN_PROMOTION_* arrays
  this.computer_level = P4WN_DEFAULT_LEVEL;
  this.buttons = {
    elements: [],
    refreshers: []
  };
  this.move_listeners = [];
  return this;
};

//TODO: Auswahl für Interactionlistener als control
_p4d_proto.write_board_html = function() {
  var canvas = this.elements.boardCanvas;
  var chessboard = new Chessboard(canvas);
  chessboard.create();
  canvas.chessboard = chessboard;
  canvas.interactionListener = {};
  canvas.interactionListener.startListener = null;
  canvas.interactionListener.moveListenerListener = null;
  canvas.interactionListener.targetListener = null;
  if (P4WN_INTERACTION_STYLE == 1) {
    canvas.interactionListener.startListener = mouseDownListenerStart.bind(this);
    canvas.addEventListener("mousedown", canvas.interactionListener.startListener, false);
  } else if (P4WN_INTERACTION_STYLE == 2) {
    canvas.interactionListener.startListener = mouseUpListenerStart.bind(this);
    canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
  }
};

//Muss für init Methode angepasst werden. (Lädt den boardState falls übergeben)
_p4d_proto.checkCustomStart = function() {
  if (P4WN_CUSTOM_START != null) {
    engineInterface.init(P4WN_CUSTOM_START);
  }
};

//Zeichnet canvas neu
_p4d_proto.refresh = function() {
  this.elements.boardCanvas.chessboard.loadBoard(engineInterface.getBoard());
};

function p4d_new_child(element, childtag, className) {
  var child = document.createElement(childtag);
  element.appendChild(child);
  if (className !== undefined) {
    child.className = className;
  }
  return child;
}

//Auto play timeout verzögert die Züge des Computers, da sonst bei Comp vs. Comp Spielen die Spiele quasi direkt zuende wären, weil es so schnell geht.
_p4d_proto.next_move = function()  {
  console.log("in");
  var nextColor = engineInterface.whosTurn();
  var mover = (nextColor == "black") ? 1 : 0;
  if (this.players[mover] == 'computer' &&
  this.auto_play_timeout === undefined) {
    var timeout = (this.players[1 - mover] == 'computer') ? 500: 10;
    var p4d = this;
	  this.auto_play_timeout = window.setTimeout(function() {
      this.computer_move()}, timeout);
  }
};

_p4d_proto.computer_move = function() {
  this.auto_play_timeout = undefined;
  var move = engineInterface.computerMove();

  var timeout = this.animateMove(move.start, move.target,
  function() {engineInterface.move(move.start, move.target);}.bind(this));
};

//TODO: Promotion in engine setzen ==> Parameter/Konstante promotion in chessboard entfernen
_p4d_proto.move = function(start, end, promotion) {
  var moveResult = engineInterface.move(start, end);
  console.log(moveResult);
  console.log(engineInterface.isGameOver());
  if (moveResult && !engineInterface.isGameOver()) {
            this.next_move_timeout = window.setTimeout(
                function(p4d) {
                    return function() {
                        p4d.next_move();
                    };
                }(this), 1);
        }
        return moveResult;
};

//Nur fürs animieren mehrerer moves (auf einmal)
_p4d_proto.animateMoves = function(moves) {
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

_p4d_proto.animateMove = function(start, target, callback) {
  var canvas = this.elements.boardCanvas;
  var chessboard = canvas.chessboard;
  var fields = chessboard.fields;
  var startField = null;
  var targetField = null;
  var stepsPerField = 50;
  var timePerStep = 10;
  for (var i = 0; i < fields.length; i++) {
    for (var j = 0; j < 8; j++) {
      if (fields[i][j].boardID == start) {
        startField = fields[i][j];
      }
      if (fields[i][j].boardID == target) {
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
        chessboard.draw();
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

function p4wnify(id) {
  var chessGame = new P4wn_display(id);
  chessGame.render_elements();
  chessGame.write_board_html();
  chessGame.checkCustomStart();
  chessGame.refresh();
  return chessGame;
}

function mouseDownListenerStart(evt) {
  var canvas = this.elements.boardCanvas;
  var board = canvas.chessboard;

  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  for (var i = 0; i < board.pieces.length; i++) {
    var piece = board.pieces[i];
    if (mouseX >= piece.posX && mouseX <= piece.posX + piece.size
      && mouseY >= piece.posY && mouseY <= piece.posY + piece.size) {
        canvas.dragging = true;
        canvas.dragHoldX = mouseX - piece.posX;
        canvas.dragHoldY = mouseY - piece.posY;
        canvas.draggedPiece = piece;
    }
  }

  if (canvas.dragging) {
    var interactionListener = canvas.interactionListener;
    interactionListener.moveListener = mouseMoveListener.bind(this);
    window.addEventListener("mousemove", interactionListener.moveListener, false);
    canvas.removeEventListener("mousedown", interactionListener.startListener, false);
    interactionListener.startListener = null;
    interactionListener.targetListener = mouseUpListenerTarget.bind(this);
    window.addEventListener("mouseup", interactionListener.targetListener, false);
  }
  return false;
}

function mouseUpListenerStart(evt) {
  var canvas = this.elements.boardCanvas;
  var board = canvas.chessboard;

  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  for (var i = 0; i < board.pieces.length; i++) {
    var piece = board.pieces[i];
    if (mouseX >= piece.posX && mouseX <= piece.posX + piece.size
      && mouseY >= piece.posY && mouseY <= piece.posY + piece.size) {
        canvas.dragging = true;
        canvas.dragHoldX = mouseX - piece.posX;
        canvas.dragHoldY = mouseY - piece.posY;
        canvas.draggedPiece = piece;
    }
  }
  if (canvas.dragging) {
    var interactionListener = canvas.interactionListener;
    interactionListener.moveListener = mouseMoveListener.bind(this);
    window.addEventListener("mousemove", interactionListener.moveListener, false);
    canvas.removeEventListener("mouseup", interactionListener.startListener, false);
    interactionListener.startListener = null;
    interactionListener.targetListener = mouseUpListenerTarget.bind(this);
    canvas.startEvent = evt;
    window.addEventListener("mouseup", interactionListener.targetListener, false);
  }
  return false;
}

function mouseMoveListener(evt) {
  var canvas = this.elements.boardCanvas;
  var posX;
  var posY;
  var shapeRad = canvas.draggedPiece.size;
  var minX = 0;
  var maxX = canvas.width - shapeRad;
  var minY = 0;
  var maxY = canvas.height - shapeRad;
  //getting mouse position correctly
  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  //clamp x and y positions to prevent object from dragging outside of canvas
  posX = mouseX - canvas.dragHoldX;
  posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
  posY = mouseY - canvas.dragHoldY;
  posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);

  canvas.draggedPiece.posX = posX;
  canvas.draggedPiece.posY = posY;

  canvas.chessboard.draw();
}

function mouseUpListenerTarget(evt) {
  var canvas = this.elements.boardCanvas;
  if (canvas.startEvent != evt) {
    var piece = canvas.draggedPiece;
    var startField = null;
    var targetField = null;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var currentField = canvas.chessboard.fields[i][j];
        var bRect = canvas.getBoundingClientRect();
        mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
        mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

        if (currentField.piece == piece) {
          startField = currentField;
        }
        if (mouseX >= currentField.posX && mouseX <= currentField.posX + currentField.size
          && mouseY >= currentField.posY && mouseY <= currentField.posY + currentField.size) {
            targetField = currentField;
        }
      }
    }
    if (targetField != null) {
      var interactionListener = canvas.interactionListener;
      window.removeEventListener("mousemove", interactionListener.moveListener, false);
      interactionListener.moveListener = null;
      window.removeEventListener("mouseup", interactionListener.targetListener, false);
      interactionListener.targetListener = null;
      if (P4WN_INTERACTION_STYLE == 1) {
        interactionListener.startListener = mouseDownListenerStart.bind(this);
        canvas.addEventListener("mousedown", canvas.interactionListener.startListener, false);
      } else if (P4WN_INTERACTION_STYLE == 2) {
        interactionListener.startListener = mouseUpListenerStart.bind(this);
        canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
      }
      var moveResult = this.move(startField.boardID, targetField.boardID, P4WN_PROMOTION_INTS[game.pawn_becomes]);
      if (!moveResult) {
        startField.setPiece(canvas.draggedPiece);
      }
      canvas.dragging = false;
      canvas.draggedPiece = null;
      this.refresh();
    }

  }
}
