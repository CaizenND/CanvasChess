function BoardEditor(canvas, frontEnd, frontEndControls) {
  this.canvas = canvas;
  this.frontEnd = frontEnd;
  this.pieces = [];
  this.width = this.frontEnd.CANVAS_OFFSET_LEFT;
  this.height = this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 8);
  this.frontEndControls = frontEndControls;
  this.controls = null;

  this.buildPieces();

  this.buildControls(frontEndControls);
};

BoardEditor.prototype.buildControls = function(frontEndControls) {
  this.controls = createNewChild(frontEndControls, "div", "editorControls");
  // active player
  var labelActive = createNewChild(this.controls, "label", "activePlayer");
  labelActive.innerHTML = "active player:"
  this.controls.activePlayer = createNewChild(labelActive, "select", "activePlayerSelect");
  var playerWhite = createNewChild(this.controls.activePlayer, "option", "white");
  playerWhite.value = "w";
  playerWhite.innerHTML = "white";
  var playerBlack = createNewChild(this.controls.activePlayer, "option", "black");
  playerBlack.value = "b";
  playerBlack.innerHTML = "black";
  // white Rochade
  var labelwr = createNewChild(this.controls, "label", "rochade");
  labelwr.innerHTML = "white Rochades:"
  this.controls.whiteRochade = createNewChild(labelwr, "select", "rochadeSelect");
  this.controls.whiteRochade.none = createNewChild(this.controls.whiteRochade, "option");
  this.controls.whiteRochade.none.value = "";
  this.controls.whiteRochade.none.innerHTML = "";
  this.controls.whiteRochade.king_queen = null;
  this.controls.whiteRochade.king = null;
  this.controls.whiteRochade.queen = null;
  // black Rochade
  var labelbr = createNewChild(this.controls, "label", "rochade");
  labelbr.innerHTML = "black Rochades:"
  this.controls.blackRochade = createNewChild(labelbr, "select", "rochadeSelect");
  this.controls.blackRochade.none = createNewChild(this.controls.blackRochade, "option");
  this.controls.blackRochade.none.value = "";
  this.controls.blackRochade.none.innerHTML = "";
  this.controls.blackRochade.king_queen = null;
  this.controls.blackRochade.king = null;
  this.controls.blackRochade.queen = null;
  this.checkRochade();
  // continue button
  this.controls.continueButton = createNewChild(this.controls, "button", "continue");
  this.controls.continueButton.innerHTML = "Continue"
  this.controls.continueButton.onclick = this.exportFEN.bind(this);
  // mouse Listener
  this.canvas.interactionListener.startListener = EditorStartListener.bind(this);
  this.canvas.addEventListener("mouseup", this.canvas.interactionListener.startListener, false);
};

BoardEditor.prototype.destroyControls = function() {
  this.frontEndControls.removeChild(this.controls);
  var canvas = this.frontEnd.chessboard.canvas;
  var interactionListener = canvas.interactionListener;
  canvas.removeEventListener("mouseup", interactionListener.startListener, false);
  canvas.removeEventListener("mousemove", interactionListener.moveListener, false);
  canvas.removeEventListener("mouseup", interactionListener.targetListener, false);
};

BoardEditor.prototype.buildPieces = function() {
  var currentPiece = new Piece("black", "pawn", this.canvas);
  currentPiece.setPosition(this.frontEnd.SQUARE_SIZE * 0.1,
    this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 0.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "rook", this.canvas);
  currentPiece.setPosition(this.frontEnd.SQUARE_SIZE * 1.1,
    this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 0.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "knight", this.canvas);
  currentPiece.setPosition(this.frontEnd.SQUARE_SIZE * 0.1,
    this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 1.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "bishop", this.canvas);
  currentPiece.setPosition(this.frontEnd.SQUARE_SIZE * 1.1,
    this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 1.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "queen", this.canvas);
  currentPiece.setPosition(this.frontEnd.SQUARE_SIZE * 0.1,
    this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 2.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("black", "king", this.canvas);
  currentPiece.setPosition(this.frontEnd.SQUARE_SIZE * 1.1,
    this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 2.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "pawn", this.canvas);
  currentPiece.setPosition(this.frontEnd.SQUARE_SIZE * 0.1,
    this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 5.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "rook", this.canvas);
  currentPiece.setPosition(this.frontEnd.SQUARE_SIZE * 1.1,
    this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 5.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "knight", this.canvas);
  currentPiece.setPosition(this.frontEnd.SQUARE_SIZE * 0.1,
    this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 6.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "bishop", this.canvas);
  currentPiece.setPosition(this.frontEnd.SQUARE_SIZE * 1.1,
    this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 6.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "queen", this.canvas);
  currentPiece.setPosition(this.frontEnd.SQUARE_SIZE * 0.1,
    this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 7.1));
  this.pieces.push(currentPiece);

  currentPiece = new Piece("white", "king", this.canvas);
  currentPiece.setPosition(this.frontEnd.SQUARE_SIZE * 1.1,
    this.frontEnd.CANVAS_OFFSET_TOP + this.frontEnd.BOARD_OFFSET_TOP + (this.frontEnd.SQUARE_SIZE * 7.1));
  this.pieces.push(currentPiece);

  for (var i = 0; i < this.pieces.length; i++) {
    this.pieces[i].setSize(this.frontEnd.SQUARE_SIZE * 0.8);
    this.pieces[i].setID(-1, -1);
    this.pieces[i].loadImage();
  }
};

BoardEditor.prototype.checkRochade = function() {
  var fields = this.frontEnd.chessboard.fields;
  // white Rochade
  if (this.controls.whiteRochade.king_queen != null) {
    this.controls.whiteRochade.removeChild(this.controls.whiteRochade.king_queen);
    this.controls.whiteRochade.king_queen = null;
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
      this.controls.whiteRochade.king_queen = createNewChild(this.controls.whiteRochade, "option");
      this.controls.whiteRochade.king_queen.innerHTML = "KQ";
      this.controls.whiteRochade.king_queen.value = "KQ";
    }
    if (wRookRInPos) {
      this.controls.whiteRochade.king = createNewChild(this.controls.whiteRochade, "option");
      this.controls.whiteRochade.king.innerHTML = "K";
      this.controls.whiteRochade.king.value = "K";
    }
    if (wRookLInPos) {
      this.controls.whiteRochade.queen = createNewChild(this.controls.whiteRochade, "option");
      this.controls.whiteRochade.queen.innerHTML = "Q";
      this.controls.whiteRochade.queen.value = "Q";
    }
  }

  // black Rochade
  if (this.controls.blackRochade.king_queen != null) {
    this.controls.blackRochade.removeChild(this.controls.blackRochade.king_queen);
    this.controls.blackRochade.king_queen = null;
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
      this.controls.blackRochade.king_queen = createNewChild(this.controls.blackRochade, "option");
      this.controls.blackRochade.king_queen.innerHTML = "kq";
      this.controls.blackRochade.king_queen.value = "kq";
    }
    if (bRookRInPos) {
      this.controls.blackRochade.king = createNewChild(this.controls.blackRochade, "option");
      this.controls.blackRochade.king.innerHTML = "k";
      this.controls.blackRochade.king.value = "k";
    }
    if (bRookLInPos) {
      this.controls.blackRochade.queen = createNewChild(this.controls.blackRochade, "option");
      this.controls.blackRochade.queen.innerHTML = "q";
      this.controls.blackRochade.queen.value = "q";
    }
  }
};

BoardEditor.prototype.draw = function() {
  var ctx = this.canvas.getContext("2d");
  ctx.save();
  ctx.fillStyle = "White";
  ctx.fillRect(0, 0, this.width, this.height);
  ctx.restore();
  for (var i = 0; i < this.pieces.length; i++) {
    this.pieces[i].draw();
  }
};

BoardEditor.prototype.exportFEN = function() {
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
