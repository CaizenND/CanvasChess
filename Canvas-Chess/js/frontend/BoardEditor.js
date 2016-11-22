function BoardEditor(frontEnd, frontEndControls) {
  this.frontEnd = frontEnd;
  var board = this.frontEnd.chessboard;
  var canvas = board.canvas;
  this.frontEndControls = frontEndControls;
  this.controls = createEditorControls(frontEndControls, this);

  board.CANVAS_OFFSET_LEFT = 2 * board.SQUARE_SIZE;
  board.setup();
  board.loadBoard(null);
  canvas.addDrawableObject(this, true);

  this.buildPieces();

  this.checkRochade();

  // mouse Listener
  canvas.interactionListener.startListener = EditorStartListener.bind(this);
  canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
};

BoardEditor.prototype.destroyControls = function() {
  var canvas = frontEnd.chessboard.canvas;
  this.frontEndControls.removeChild(this.controls.meta);
  this.frontEndControls.removeChild(this.controls);
  var interactionListener = canvas.interactionListener;
  canvas.removeEventListener("mouseup", interactionListener.startListener, false);
  canvas.removeEventListener("mousemove", interactionListener.moveListener, false);
  canvas.removeEventListener("mouseup", interactionListener.targetListener, false);
};

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
    this.pieces[i].setID(-1, -1);
    this.pieces[i].loadImage();
  }
};

BoardEditor.prototype.checkRochade = function() {
  var fields = this.frontEnd.chessboard.fields;
  // white Rochade
  if (this.controls.whiteRochade.kingQueen != null) {
    this.controls.whiteRochade.removeChild(this.controls.whiteRochade.kingQueen);
    this.controls.whiteRochade.kingQueen = null;
  }
  if (this.controls.whiteRochade.king != null) {
    this.controls.whiteRochade.removeChild(this.controls.whiteRochade.king);
    this.controls.whiteRochade.king = null;
  }
  if (this.controls.whiteRochade.queen != null) {
    this.controls.whiteRochade.removeChild(this.controls.whiteRochade.queen);
    this.controls.whiteRochade.queen = null;
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
      this.controls.whiteRochade.kingQueen = createNewChild(this.controls.whiteRochade, "option");
      this.controls.whiteRochade.kingQueen.appendChild(document.createTextNode("KQ"));
      this.controls.whiteRochade.kingQueen.value = "KQ";
    }
    if (wRookRInPos) {
      this.controls.whiteRochade.king = createNewChild(this.controls.whiteRochade, "option");
      this.controls.whiteRochade.king.appendChild(document.createTextNode("K"));
      this.controls.whiteRochade.king.value = "K";
    }
    if (wRookLInPos) {
      this.controls.whiteRochade.queen = createNewChild(this.controls.whiteRochade, "option");
      this.controls.whiteRochade.queen.appendChild(document.createTextNode("Q"));
      this.controls.whiteRochade.queen.value = "Q";
    }
  }

  // black Rochade
  if (this.controls.blackRochade.kingQueen != null) {
    this.controls.blackRochade.removeChild(this.controls.blackRochade.kingQueen);
    this.controls.blackRochade.kingQueen = null;
  }
  if (this.controls.blackRochade.king != null) {
    this.controls.blackRochade.removeChild(this.controls.blackRochade.king);
    this.controls.blackRochade.king = null;
  }
  if (this.controls.blackRochade.queen != null) {
    this.controls.blackRochade.removeChild(this.controls.blackRochade.queen);
    this.controls.blackRochade.queen = null;
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
      this.controls.blackRochade.kingQueen = createNewChild(this.controls.blackRochade, "option");
      this.controls.blackRochade.kingQueen.appendChild(document.createTextNode("kq"));
      this.controls.blackRochade.kingQueen.value = "kq";
    }
    if (bRookRInPos) {
      this.controls.blackRochade.king = createNewChild(this.controls.blackRochade, "option");
      this.controls.blackRochade.king.appendChild(document.createTextNode("k"));
      this.controls.blackRochade.king.value = "k";
    }
    if (bRookLInPos) {
      this.controls.blackRochade.queen = createNewChild(this.controls.blackRochade, "option");
      this.controls.blackRochade.queen.appendChild(document.createTextNode("q"));
      this.controls.blackRochade.queen.value = "q";
    }
  }
};

BoardEditor.prototype.draw = function() {
  for (var i = 0; i < this.pieces.length; i++) {
    this.pieces[i].draw();
  }
};

BoardEditor.prototype.exportFEN = function() {
  var board = this.frontEnd.chessboard;
  var canvas = board.canvas;
  // Piece placement
  var pieceFEN = this.getPiecePlacementFEN();
  // Active player
  var activeFEN = " " + this.controls.activePlayer.value;
  // Rochade
  var rochadeFEN = " " + this.controls.whiteRochade.value + this.controls.blackRochade.value;
  if (rochadeFEN == " ") {
    rochadeFEN += "-";
  }
  // En passant
  var enPassantFEN = " -";
  // Halfmove clock
  var halfmoveFEN = " 0";
  // Fullmove number
  var fullmoveFEN = " 1";
  var fen = pieceFEN + activeFEN + rochadeFEN + enPassantFEN + halfmoveFEN + fullmoveFEN;
  this.destroyControls();
  canvas.removeDrawableObject(this);
  board.CANVAS_OFFSET_LEFT = 0;
  this.frontEnd.editorCustomStart(fen);
};

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
