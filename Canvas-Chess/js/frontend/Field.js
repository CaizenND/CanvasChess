
/**
 * Constructor
 * Creates a field object and initializes attributes.
 */
function Field() {
  this.piece = null;
  this.textualID = "";
  this.idX = 0;
  this.idY = 0;
  this.posX = 0;
  this.posY = 0;
  this.size = 30;
  this.color = "";
};

/**
 * Adds a piece to the field.
 * Only required for finding move-start and -target field.
 * The main piece management is handled in the chessboad object.
 * @param piece   Piece object that should be added to the field
 */
Field.prototype.setPiece = function(piece) {
    this.piece = piece;
    if (this.piece != null) {
      var bounds = this.size * 0.2 * 0.5;
      this.piece.setPosition(this.posX + bounds, this.posY + bounds);
      this.piece.setSize(this.size * 0.8);
    }
};

/**
 * Sets the textual ID for the field. ("a1" - "h8")
 * @param id    Textual ID for the field
 */
Field.prototype.setTextualID = function(id) {
  this.textualID = id;
};

/**
 * Sets the numeric ID for the field. (1 - 8)
 * @param x   X-coordinate of the ID
 * @param y   Y-coordinate of the ID
 */
Field.prototype.setID = function(x, y) {
  this.idX = x;
  this.idY = y;
};

/**
 * Sets the position of the field on the canvas.
 * @param x   X-coordinate on the canvas
 * @param y   Y-coordinate on the canvas
 */
Field.prototype.setPosition = function(x, y) {
  this.posX = x;
  this.posY = y;
  if (this.piece != null) {
    this.setPiece(this.piece);
  }
};

/**
 * Sets the size of the field (width and height) on the canvas.
 * @param size    Size of the field (width and height) on the canvas
 */
Field.prototype.setSize = function(size) {
  this.size = size;
};

/**
 * Sets the color of the field on the canvas.
 * @param fieldColor    Color of the field on the canvas
 */
Field.prototype.setColor = function(fieldColor) {
  if (fieldColor == "Ivory" || fieldColor == "BurlyWood") {
    this.color = fieldColor;
  }
};

/**
 * Draws the field on the canvas.
 */
Field.prototype.draw = function(canvas) {
  var ctx = canvas.getContext("2d");
  ctx.save();
  ctx.fillStyle = this.color;
  ctx.fillRect(this.posX, this.posY, this.size, this.size);
  ctx.restore();
};
