
/**
* Constructor
* Creates a piece object and initializes attributes.
 * @param pieceColor    Color of the piece (white / black)
 * @param pieceType     Type of the piece (pawn, king, ...)
 * @param chessboard    Chessboard object that should manage the piece
 */
function Piece(pieceColor, pieceType, chessboard) {
  this.color = pieceColor;
  this.type = pieceType;
  this.board = chessboard;
  this.image = new Image();
  this.posX = 0;
  this.posY = 0;
  this.size = 24;
};

/**
 * Sets the position of the piece on the canvas.
 * @param x   X-coordinate on the canvas
 * @param y   Y-coordinate on the canvas
 */
Piece.prototype.setPosition = function(x, y) {
  this.posX = x;
  this.posY = y;
};

/**
 * Sets the size of the piece (width and height) on the canvas.
 * @param size    Size of the piece (width and height) on the canvas
 */
Piece.prototype.setSize = function(size) {
  this.size = size;
};

/**
 * Draws the piece / image on the canvas.
 */
Piece.prototype.draw = function(canvas, dragged) {
  var ctx = canvas.getContext("2d");
  ctx.save();
  if (dragged != undefined && dragged) {
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  ctx.drawImage(this.image, this.posX, this.posY, this.size, this.size);
  ctx.restore();
};

/**
 * Loads the correct image for the pieces color and type and draws it to the
 * canvas.
 */
Piece.prototype.loadImage = function(canvas) {
  this.image.onload = (function(piece) {
    return function() {
      piece.draw(canvas);
    };
  })(this);
  var imgPath = "../img/" + this.color + "_" + this.type + ".gif";
  this.image.src = imgPath;
};
