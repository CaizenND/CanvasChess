
/**
 * Constructor
 * Sets up the editor by creating the controls, registering itself at the canvas
 * and adding a mouselistener to the canvas.
 * @param returnToFrontEnd    The functionn, which is called after the Editor is done
 * @param frontendControls    The div element, which should contain the controls
 * @param chessboard          The chessboard object, which should display the pieces
 * @param canvas              The canvas element, which should be used to display the editor
 */
function BoardEditor(returnToFrontEnd, frontendControls, chessboard, canvas) {
  this.returnToFrontEnd = returnToFrontEnd;

  // controls
  this.frontendControls = frontendControls;
  this.controls = createEditorControls(frontendControls, this);

  // canvas
  chessboard.CANVAS_OFFSET_LEFT = 2 * chessboard.SQUARE_SIZE;
  chessboard.setup();
  chessboard.loadBoard(null, canvas);

  this.buildPieces(chessboard, canvas);
  var castling = chessboard.checkCastling();
  this.updateCastlingOptions(castling);
};

/**
 * Creates the Piece objects that are drawn in the editor area of the canvas.
 * @param chessboard          The chessboard object, which should display the pieces
 * @param canvas  The canvas element, which should be used to display the pieces
 */
BoardEditor.prototype.buildPieces = function(chessboard, canvas) {
  this.pieces = [];
  var currentPiece = new Piece("black", "pawn", chessboard);
  currentPiece.setPosition(chessboard.SQUARE_SIZE * 0.1,
    chessboard.CANVAS_OFFSET_TOP + chessboard.BOARD_OFFSET_TOP + (chessboard.SQUARE_SIZE * 0.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "rook", chessboard);
  currentPiece.setPosition(chessboard.SQUARE_SIZE * 1.1,
    chessboard.CANVAS_OFFSET_TOP + chessboard.BOARD_OFFSET_TOP + (chessboard.SQUARE_SIZE * 0.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "knight", chessboard);
  currentPiece.setPosition(chessboard.SQUARE_SIZE * 0.1,
    chessboard.CANVAS_OFFSET_TOP + chessboard.BOARD_OFFSET_TOP + (chessboard.SQUARE_SIZE * 1.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "bishop", chessboard);
  currentPiece.setPosition(chessboard.SQUARE_SIZE * 1.1,
    chessboard.CANVAS_OFFSET_TOP + chessboard.BOARD_OFFSET_TOP + (chessboard.SQUARE_SIZE * 1.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "queen", chessboard);
  currentPiece.setPosition(chessboard.SQUARE_SIZE * 0.1,
    chessboard.CANVAS_OFFSET_TOP + chessboard.BOARD_OFFSET_TOP + (chessboard.SQUARE_SIZE * 2.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "king", chessboard);
  currentPiece.setPosition(chessboard.SQUARE_SIZE * 1.1,
    chessboard.CANVAS_OFFSET_TOP + chessboard.BOARD_OFFSET_TOP + (chessboard.SQUARE_SIZE * 2.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "pawn", chessboard);
  currentPiece.setPosition(chessboard.SQUARE_SIZE * 0.1,
    chessboard.CANVAS_OFFSET_TOP + chessboard.BOARD_OFFSET_TOP + (chessboard.SQUARE_SIZE * 5.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "rook", chessboard);
  currentPiece.setPosition(chessboard.SQUARE_SIZE * 1.1,
    chessboard.CANVAS_OFFSET_TOP + chessboard.BOARD_OFFSET_TOP + (chessboard.SQUARE_SIZE * 5.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "knight", chessboard);
  currentPiece.setPosition(chessboard.SQUARE_SIZE * 0.1,
    chessboard.CANVAS_OFFSET_TOP + chessboard.BOARD_OFFSET_TOP + (chessboard.SQUARE_SIZE * 6.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "bishop", chessboard);
  currentPiece.setPosition(chessboard.SQUARE_SIZE * 1.1,
    chessboard.CANVAS_OFFSET_TOP + chessboard.BOARD_OFFSET_TOP + (chessboard.SQUARE_SIZE * 6.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "queen", chessboard);
  currentPiece.setPosition(chessboard.SQUARE_SIZE * 0.1,
    chessboard.CANVAS_OFFSET_TOP + chessboard.BOARD_OFFSET_TOP + (chessboard.SQUARE_SIZE * 7.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "king", chessboard);
  currentPiece.setPosition(chessboard.SQUARE_SIZE * 1.1,
    chessboard.CANVAS_OFFSET_TOP + chessboard.BOARD_OFFSET_TOP + (chessboard.SQUARE_SIZE * 7.1));
  this.pieces.push(currentPiece);

  for (var i = 0; i < this.pieces.length; i++) {
    this.pieces[i].setSize(chessboard.SQUARE_SIZE * 0.8);
    this.pieces[i].loadImage(canvas);
  }
};

/**
 * Makes the castling options available in the respective dropdown menu.
 * @param castling  The available castling options
 */
BoardEditor.prototype.updateCastlingOptions = function(castling) {
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
  if (castling.wk) {
    if (castling.wrl && castling.wrr) {
      this.controls.whiteCastling.kingQueen = createNewChild(this.controls.whiteCastling, "option");
      this.controls.whiteCastling.kingQueen.appendChild(document.createTextNode("KQ"));
      this.controls.whiteCastling.kingQueen.value = "KQ";
    }
    if (castling.wrr) {
      this.controls.whiteCastling.king = createNewChild(this.controls.whiteCastling, "option");
      this.controls.whiteCastling.king.appendChild(document.createTextNode("K"));
      this.controls.whiteCastling.king.value = "K";
    }
    if (castling.wrl) {
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
  if (castling.bk) {
    if (castling.brl && castling.brr) {
      this.controls.blackCastling.kingQueen = createNewChild(this.controls.blackCastling, "option");
      this.controls.blackCastling.kingQueen.appendChild(document.createTextNode("kq"));
      this.controls.blackCastling.kingQueen.value = "kq";
    }
    if (castling.brr) {
      this.controls.blackCastling.king = createNewChild(this.controls.blackCastling, "option");
      this.controls.blackCastling.king.appendChild(document.createTextNode("k"));
      this.controls.blackCastling.king.value = "k";
    }
    if (castling.brl) {
      this.controls.blackCastling.queen = createNewChild(this.controls.blackCastling, "option");
      this.controls.blackCastling.queen.appendChild(document.createTextNode("q"));
      this.controls.blackCastling.queen.value = "q";
    }
  }
};

/**
 * Draws itself / the editor pieces to the canvas.
 */
BoardEditor.prototype.draw = function(canvas) {
  for (var i = 0; i < this.pieces.length; i++) {
    this.pieces[i].draw(canvas);
  }
};

/**
 * Generates a FEN-string from the current pieces on the board and the selected
 * options in the controls area. Removes itself from the frontend and the canvas
 * and updates the frontend with the FEN-string.
 */
BoardEditor.prototype.exportFEN = function() {
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
  var fen = activeFEN + castlingFEN + enPassantFEN + halfmoveFEN + fullmoveFEN;
  this.frontendControls.removeChild(this.controls.meta);
  this.frontendControls.removeChild(this.controls);
  this.returnToFrontEnd(fen);
};
