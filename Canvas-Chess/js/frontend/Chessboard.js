
/**
 * Constructor
 * Creates the Chessboard by initializing the relevant attributes.
 */
function Chessboard() {
  this.fields = [];
  this.pieces = [];
  // Weiß oben oder unten?
  this.orientation = 1; // 1, -1
  this.posX = 0;
  this.posY = 0;
  this.width = 0;
  this.height = 0;
  this.dragging = {};
  this.dragging.dragHoldX = null;
  this.dragging.dragHoldY = null;
  this.dragging.draggedPiece = null;
  this.SQUARE_SIZE = 55;
  this.BOARD_OFFSET_TOP = 44; // Beschriftung oben
  this.BOARD_OFFSET_LEFT = 44; // Beschriftung unten
  this.CANVAS_OFFSET_TOP = 0; // feier Raum oben
  this.CANVAS_OFFSET_LEFT = 0; // freier Raum unten
};

/**
 * Sets up the Chessboard by resizing itself based on the currently defined
 * values and creating fields based on the size.
 */
Chessboard.prototype.setup = function() {
  this.posX = this.CANVAS_OFFSET_LEFT;
  this.posY = this.CANVAS_OFFSET_TOP;
  this.width = this.BOARD_OFFSET_LEFT+(8*this.SQUARE_SIZE);
  this.height = this.BOARD_OFFSET_TOP+(8*this.SQUARE_SIZE);
  this.pieces = new Array();
  this.fields = new Array(8);
  for (var i = 0; i < 8; i++) {
    this.fields[i] = new Array();
  }
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var field = new Field(this);
      this.fields[i].push(field);
      var textualID = this.getLetterOfID(j+1) + (8-i);
      field.setTextualID(textualID);
      field.setID(j+1, 8-i);
      field.setPosition(this.posX + this.BOARD_OFFSET_LEFT+(j*this.SQUARE_SIZE),
        this.posY + this.BOARD_OFFSET_TOP+(i*this.SQUARE_SIZE));
      field.setSize(this.SQUARE_SIZE);
      if ((i+j)%2 == 1) {
        field.setColor("BurlyWood");
      } else {
        field.setColor("Ivory");
      }
    }
  }
};

/**
 * Translates an integer index to the respective index letter.
 * @param id    Integer index that should be translated
 * @return String, containing the index letter ("a"-"h" or "")
 */
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

/**
 * Switches the orientation of the board horizontally.
 */
Chessboard.prototype.switchPositions = function() {
  this.orientation = -1 * this.orientation;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var currentField = this.fields[i][j];
      if (this.orientation == 1) {
        currentField.setPosition(this.posX + this.BOARD_OFFSET_LEFT+(j*this.SQUARE_SIZE),
            this.posY + this.BOARD_OFFSET_TOP+(i*this.SQUARE_SIZE));
      } else if (this.orientation == -1) {
        currentField.setPosition(this.posX + this.BOARD_OFFSET_LEFT+(j*this.SQUARE_SIZE),
            this.posY + this.BOARD_OFFSET_TOP+((7-i)*this.SQUARE_SIZE));
      }
    }
  }
};

/**
 * Draws itself to the canvas. Includes lettering, fields, pieces and currently
 * dragged piece.
 */
Chessboard.prototype.draw = function(canvas) {
  var ctx = canvas.getContext("2d");
  ctx.save();
  ctx.fillStyle = "Black";
  var fontSize = Math.min(this.SQUARE_SIZE*0.5, this.BOARD_OFFSET_TOP*0.8);
  ctx.font = fontSize + "px Arial";
  ctx.textBaseline = "top";
  var text = "";
  var textPaddingTop = 0;
  var textPaddingLeft = 0;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      if (i == 0) {
        text = this.getLetterOfID(j+1);
        textPaddingTop = this.posY+(this.BOARD_OFFSET_TOP-fontSize)*0.5;
        textPaddingLeft = this.posX+(this.SQUARE_SIZE-ctx.measureText(text).width)*0.5;
        ctx.fillText(text,
          this.BOARD_OFFSET_LEFT+(j*this.SQUARE_SIZE)+textPaddingLeft,
          textPaddingTop);
      }
      if (j == 0) {
        if (this.orientation == 1) {
          text = 8-i;
        } else if (this.orientation == -1) {
          text = i+1;
        }
        textPaddingTop = this.posY+(this.SQUARE_SIZE-fontSize)*0.5;
        textPaddingLeft = this.posX+(this.BOARD_OFFSET_LEFT-ctx.measureText(text).width)*0.5;
        ctx.fillText(text, textPaddingLeft,
          this.BOARD_OFFSET_TOP+(i*this.SQUARE_SIZE)+textPaddingTop);
      }
      this.fields[i][j].draw(canvas);
    }
  }
  ctx.strokeRect(this.posX+this.BOARD_OFFSET_LEFT,
    this.posY+this.BOARD_OFFSET_TOP,
    8*this.SQUARE_SIZE, 8*this.SQUARE_SIZE);
  ctx.restore();
  for (var i = 0; i < this.pieces.length; i++) {
    if (this.pieces[i] != this.dragging.draggedPiece) {
      this.pieces[i].draw(canvas);
    }
  }
  if (this.dragging.draggedPiece != null) {
    this.dragging.draggedPiece.draw(canvas, true);
  }
};

/**
 * Imports a normalized board state and sets creates pieces accordingly.
 * @param boardState
 * @param canvas
 */
Chessboard.prototype.loadBoard = function(boardState, canvas) {
  // Prevent deleted pieces from loading their images and drawing to the canvas
  for (var i = 0; i < this.pieces.length; i++) {
    this.pieces[i].image.onload = null;
  }

  this.pieces = new Array();
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      this.fields[i][j].setPiece(null);
    }
  }

  if (boardState != null) {
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var pieceInfo = boardState[7-i][j].split("-");
        if (pieceInfo.length == 2) {
          var currentPiece = new Piece(pieceInfo[0], pieceInfo[1], this);
          this.pieces.push(currentPiece);
          currentPiece.loadImage(canvas);
          if (this.orientation == 1) {
            this.fields[i][j].setPiece(currentPiece);
          } else if (this.orientation == -1) {
            this.fields[7-i][j].setPiece(currentPiece);
          }
        }
      }
    }
  }
};

/**
 * Generates the board placement part of a FEN-string the current pieces on the
 * board.
 * @return String, containing the board placement in FEN-notation
 */
Chessboard.prototype.getPiecePlacementFEN = function() {
  var placementFEN = "";
  var emptyCount = 0;

  for (var i = 0; i < 8; i++) {

    for (var j = 0; j < 8; j++) {
      var currentField = this.fields[i][j];
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
Chessboard.prototype.getFENLetter = function(piece) {
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

/**
 * Checks whether the current pieces on the board would allow castling moves.
 * @return castling as {
  * wk: white king in position,
  * wrl: white rook queenside in position,
  * wrr: white rook kingside in position,
  * bk: black king in position,
  * brl: black rook queenside in position,
  * brr: black rook kingside in position,
}
 */
Chessboard.prototype.checkCastling = function() {

  // white castling
  var wKingInPos = false;
  if (this.fields[7][4].piece != null) {
    if (this.fields[7][4].piece.color == "white" && this.fields[7][4].piece.type == "king") {
      wKingInPos = true;
    }
  }
  var wRookLInPos = false;
  if (this.fields[7][0].piece != null) {
    if (this.fields[7][0].piece.color == "white" && this.fields[7][0].piece.type == "rook") {
      wRookLInPos = true;
    }
  }
  var wRookRInPos = false;
  if (this.fields[7][7].piece != null) {
    if (this.fields[7][7].piece.color == "white" && this.fields[7][7].piece.type == "rook") {
      wRookRInPos = true;
    }
  }

  // black castling
  var bKingInPos = false;
  if (this.fields[0][4].piece != null) {
    if (this.fields[0][4].piece.color == "black" && this.fields[0][4].piece.type == "king") {
      bKingInPos = true;
    }
  }
  var bRookLInPos = false;
  if (this.fields[0][0].piece != null) {
    if (this.fields[0][0].piece.color == "black" && this.fields[0][0].piece.type == "rook") {
      bRookLInPos = true;
    }
  }
  var bRookRInPos = false;
  if (this.fields[0][7].piece != null) {
    if (this.fields[0][7].piece.color == "black" && this.fields[0][7].piece.type == "rook") {
      bRookRInPos = true;
    }
  }
  var castling = {
    wk: wKingInPos,
    wrl: wRookLInPos,
    wrr: wRookRInPos,
    bk: bKingInPos,
    brl: bRookLInPos,
    brr: bRookRInPos
  };
  return castling;
};
