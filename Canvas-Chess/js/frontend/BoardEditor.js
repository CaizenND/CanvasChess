
/**
 * Constructor
 * Sets up the editor by creating the controls, registering itself at the canvas
 * and adding a mouselistener to the canvas.
 * @param frontEnd            The FrontEnd object, which should use the editor
 * @param frontEndControls    The div element, which should contain the controls
 */
function BoardEditor(frontEnd, frontEndControls) {
  this.frontEnd = frontEnd;
  var board = this.frontEnd.chessboard;
  var canvas = board.canvas;

  // controls
  this.frontEndControls = frontEndControls;
  this.controls = createEditorControls(frontEndControls, this);

  // canvas
  board.CANVAS_OFFSET_LEFT = 2 * board.SQUARE_SIZE;
  board.setup();
  board.loadBoard(null);
  canvas.addDrawableObject(this, true);

  this.buildPieces();
  this.checkCastling();

  // mouse Listener
  canvas.interactionListener.startListener = EditorStartListener.bind(this);
  canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
};

/**
 * Removes the editor controls from the surrounding div element und removes the
 * moselisteners.
 */
BoardEditor.prototype.destroyControls = function() {
  var canvas = frontEnd.chessboard.canvas;
  this.frontEndControls.removeChild(this.controls.meta);
  this.frontEndControls.removeChild(this.controls);
  var interactionListener = canvas.interactionListener;
  canvas.removeEventListener("mouseup", interactionListener.startListener, false);
  canvas.removeEventListener("mousemove", interactionListener.moveListener, false);
  canvas.removeEventListener("mouseup", interactionListener.targetListener, false);
};

/**
 * Creates the Piece objects that are drawn in the editor area of the canvas.
 */
BoardEditor.prototype.buildPieces = function() {
  var board = this.frontEnd.chessboard;
  var canvas = board.canvas;
  this.pieces = [];
  var currentPiece = new Piece("black", "pawn", board);
  currentPiece.setPosition(board.SQUARE_SIZE * 0.1,
    board.CANVAS_OFFSET_TOP + board.BOARD_OFFSET_TOP + (board.SQUARE_SIZE * 0.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "rook", board);
  currentPiece.setPosition(board.SQUARE_SIZE * 1.1,
    board.CANVAS_OFFSET_TOP + board.BOARD_OFFSET_TOP + (board.SQUARE_SIZE * 0.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "knight",  board);
  currentPiece.setPosition(board.SQUARE_SIZE * 0.1,
    board.CANVAS_OFFSET_TOP + board.BOARD_OFFSET_TOP + (board.SQUARE_SIZE * 1.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "bishop",  board);
  currentPiece.setPosition(board.SQUARE_SIZE * 1.1,
    board.CANVAS_OFFSET_TOP + board.BOARD_OFFSET_TOP + (board.SQUARE_SIZE * 1.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "queen",  board);
  currentPiece.setPosition(board.SQUARE_SIZE * 0.1,
    board.CANVAS_OFFSET_TOP + board.BOARD_OFFSET_TOP + (board.SQUARE_SIZE * 2.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "king",  board);
  currentPiece.setPosition(board.SQUARE_SIZE * 1.1,
    board.CANVAS_OFFSET_TOP + board.BOARD_OFFSET_TOP + (board.SQUARE_SIZE * 2.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "pawn",  board);
  currentPiece.setPosition(board.SQUARE_SIZE * 0.1,
    board.CANVAS_OFFSET_TOP + board.BOARD_OFFSET_TOP + (board.SQUARE_SIZE * 5.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "rook",  board);
  currentPiece.setPosition(board.SQUARE_SIZE * 1.1,
    board.CANVAS_OFFSET_TOP + board.BOARD_OFFSET_TOP + (board.SQUARE_SIZE * 5.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "knight",  board);
  currentPiece.setPosition(board.SQUARE_SIZE * 0.1,
    board.CANVAS_OFFSET_TOP + board.BOARD_OFFSET_TOP + (board.SQUARE_SIZE * 6.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "bishop",  board);
  currentPiece.setPosition(board.SQUARE_SIZE * 1.1,
    board.CANVAS_OFFSET_TOP + board.BOARD_OFFSET_TOP + (board.SQUARE_SIZE * 6.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "queen",  board);
  currentPiece.setPosition(board.SQUARE_SIZE * 0.1,
    board.CANVAS_OFFSET_TOP + board.BOARD_OFFSET_TOP + (board.SQUARE_SIZE * 7.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "king",  board);
  currentPiece.setPosition(board.SQUARE_SIZE * 1.1,
    board.CANVAS_OFFSET_TOP + board.BOARD_OFFSET_TOP + (board.SQUARE_SIZE * 7.1));
  this.pieces.push(currentPiece);

  for (var i = 0; i < this.pieces.length; i++) {
    this.pieces[i].setSize(board.SQUARE_SIZE * 0.8);
    this.pieces[i].loadImage();
  }
};

/**
 * Checks whether the current pieces on the board would allow castling moves and
 * makes these available in the respective dropdown menu.
 */
BoardEditor.prototype.checkCastling = function() {
  var fields = this.frontEnd.chessboard.fields;

  // white castling
  if (this.controls.whiteCastling.kingQueen != null) {
    this.controls.whiteCastling.removeChild(this.controls.whiteCastling.kingQueen);
    this.controls.whiteCastling.kingQueen = null;
  }
  if (this.controls.whiteCastling.king != null) {
    this.controls.whiteCastling.removeChild(this.controls.whiteCastling.king);
    this.controls.whiteCastling.king = null;
  }
  if (this.controls.whiteCastling.queen != null) {
    this.controls.whiteCastling.removeChild(this.controls.whiteCastling.queen);
    this.controls.whiteCastling.queen = null;
  }
  var wKingInPos = false;
  if (fields[7][4].piece != null) {
    if (fields[7][4].piece.color == "white" && fields[7][4].piece.type == "king") {
      wKingInPos = true;
    }
  }
  var wRookLInPos = false;
  if (fields[7][0].piece != null) {
    if (fields[7][0].piece.color == "white" && fields[7][0].piece.type == "rook") {
      wRookLInPos = true;
    }
  }
  var wRookRInPos = false;
  if (fields[7][7].piece != null) {
    if (fields[7][7].piece.color == "white" && fields[7][7].piece.type == "rook") {
      wRookRInPos = true;
    }
  }
  if (wKingInPos) {
    if (wRookLInPos && wRookRInPos) {
      this.controls.whiteCastling.kingQueen = createNewChild(this.controls.whiteCastling, "option");
      this.controls.whiteCastling.kingQueen.appendChild(document.createTextNode("KQ"));
      this.controls.whiteCastling.kingQueen.value = "KQ";
    }
    if (wRookRInPos) {
      this.controls.whiteCastling.king = createNewChild(this.controls.whiteCastling, "option");
      this.controls.whiteCastling.king.appendChild(document.createTextNode("K"));
      this.controls.whiteCastling.king.value = "K";
    }
    if (wRookLInPos) {
      this.controls.whiteCastling.queen = createNewChild(this.controls.whiteCastling, "option");
      this.controls.whiteCastling.queen.appendChild(document.createTextNode("Q"));
      this.controls.whiteCastling.queen.value = "Q";
    }
  }

  // black castling
  if (this.controls.blackCastling.kingQueen != null) {
    this.controls.blackCastling.removeChild(this.controls.blackCastling.kingQueen);
    this.controls.blackCastling.kingQueen = null;
  }
  if (this.controls.blackCastling.king != null) {
    this.controls.blackCastling.removeChild(this.controls.blackCastling.king);
    this.controls.blackCastling.king = null;
  }
  if (this.controls.blackCastling.queen != null) {
    this.controls.blackCastling.removeChild(this.controls.blackCastling.queen);
    this.controls.blackCastling.queen = null;
  }
  var bKingInPos = false;
  if (fields[0][4].piece != null) {
    if (fields[0][4].piece.color == "black" && fields[0][4].piece.type == "king") {
      bKingInPos = true;
    }
  }
  var bRookLInPos = false;
  if (fields[0][0].piece != null) {
    if (fields[0][0].piece.color == "black" && fields[0][0].piece.type == "rook") {
      bRookLInPos = true;
    }
  }
  var bRookRInPos = false;
  if (fields[0][7].piece != null) {
    if (fields[0][7].piece.color == "black" && fields[0][7].piece.type == "rook") {
      bRookRInPos = true;
    }
  }
  if (bKingInPos) {
    if (bRookLInPos && bRookRInPos) {
      this.controls.blackCastling.kingQueen = createNewChild(this.controls.blackCastling, "option");
      this.controls.blackCastling.kingQueen.appendChild(document.createTextNode("kq"));
      this.controls.blackCastling.kingQueen.value = "kq";
    }
    if (bRookRInPos) {
      this.controls.blackCastling.king = createNewChild(this.controls.blackCastling, "option");
      this.controls.blackCastling.king.appendChild(document.createTextNode("k"));
      this.controls.blackCastling.king.value = "k";
    }
    if (bRookLInPos) {
      this.controls.blackCastling.queen = createNewChild(this.controls.blackCastling, "option");
      this.controls.blackCastling.queen.appendChild(document.createTextNode("q"));
      this.controls.blackCastling.queen.value = "q";
    }
  }
};

/**
 * Draws itself, respectively the editor pieces to the canvas.
 */
BoardEditor.prototype.draw = function() {
  for (var i = 0; i < this.pieces.length; i++) {
    this.pieces[i].draw();
  }
};

/**
 * Generates a FEN-string from the current pieces on the board and the selected
 * options in the controls area. Removes itself from the frontend and the canvas
 * and updates the frontend with the FEN-string.
 */
BoardEditor.prototype.exportFEN = function() {
  var board = this.frontEnd.chessboard;
  var canvas = board.canvas;
  // Piece placement
  var pieceFEN = this.getPiecePlacementFEN();
  // Active player
  var activeFEN = " " + this.controls.activePlayer.value;
  // Castling
  var castlingFEN = " " + this.controls.whiteCastling.value + this.controls.blackCastling.value;
  if (castlingFEN == " ") {
    castlingFEN += "-";
  }
  // En passant
  var enPassantFEN = " -";
  // Halfmove clock
  var halfmoveFEN = " 0";
  // Fullmove number
  var fullmoveFEN = " 1";
  var fen = pieceFEN + activeFEN + castlingFEN + enPassantFEN + halfmoveFEN + fullmoveFEN;
  this.destroyControls();
  canvas.removeDrawableObject(this);
  board.CANVAS_OFFSET_LEFT = 0;
  this.frontEnd.editorCustomStart(fen);
};

/**
 * Generates the board placement part of a FEN-string the current pieces on the board.
 * @return String, containing the board placement in FEN-notation
 */
BoardEditor.prototype.getPiecePlacementFEN = function() {
  var fields = this.frontEnd.chessboard.fields;
  var placementFEN = "";
  var emptyCount = 0;

  for (var i = 0; i < 8; i++) {

    for (var j = 0; j < 8; j++) {
      var currentField = fields[i][j];
      if (currentField.piece == null) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          placementFEN += emptyCount;
          emptyCount = 0;
        }
        placementFEN += this.getFENLetter(currentField.piece);
      }
    }

    if (emptyCount > 0) {
      placementFEN += emptyCount;
      emptyCount = 0;
    }
    if (i < 7) {
      placementFEN += "/";
    }
  }

  return placementFEN;
};

/**
 * Converts a piece object to the respective letter that is used in FEN-notation.
 * @param piece   Piece object, that should be converted to a FEN-letter
 * @return String, containing the FEN-letter for the piece
 */
BoardEditor.prototype.getFENLetter = function(piece) {
  var letter = "";
  if (piece.color == "black") {
    switch (piece.type) {
      case "pawn": letter = "p"; break;
      case "rook": letter = "r"; break;
      case "knight": letter = "n"; break;
      case "bishop": letter = "b"; break;
      case "queen": letter = "q"; break;
      case "king": letter = "k"; break;
      default: break;
    }
  } else {
    switch (piece.type) {
      case "pawn": letter = "P"; break;
      case "rook": letter = "R"; break;
      case "knight": letter = "N"; break;
      case "bishop": letter = "B"; break;
      case "queen": letter = "Q"; break;
      case "king": letter = "K"; break;
      default: break;
    }
  }
  return letter;
};
