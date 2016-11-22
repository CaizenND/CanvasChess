function Field(chessboard) {
  this.canvas = chessboard.canvas;
  this.piece = null;
  this.algebraicID = "";
  this.idX = 0;
  this.idY = 0;
  this.posX = 0;
  this.posY = 0;
  this.size = 30;
  this.color = "";
}

Field.prototype.setPiece = function(piece) {
    this.piece = piece;
    if (this.piece != null) {
      var bounds = this.size * 0.2 * 0.5;
      this.piece.setPosition(this.posX + bounds, this.posY + bounds);
      this.piece.setSize(this.size * 0.8);
      this.piece.setID(this.idX, this.idY);
    }
}

Field.prototype.setAlgebraicID = function(id) {
  this.algebraicID = id;
}

Field.prototype.setID = function(x, y) {
  this.idX = x;
  this.idY = y;
}

Field.prototype.setPosition = function(x, y) {
  this.posX = x;
  this.posY = y;
  if (this.piece != null) {
    this.setPiece(this.piece);
  }
}

Field.prototype.setSize = function(size) {
  this.size = size;
}

Field.prototype.setColor = function(fieldColor) {
  if (fieldColor == "Ivory" || fieldColor == "BurlyWood") {
    this.color = fieldColor;
  }
}

Field.prototype.draw = function() {
  var ctx = this.canvas.getContext("2d");
  ctx.save();
  ctx.fillStyle = this.color;
  ctx.fillRect(this.posX, this.posY, this.size, this.size);
  ctx.restore();
  //if (this.piece != null) {
    //this.piece.draw(this.canvas);
  //}
}
