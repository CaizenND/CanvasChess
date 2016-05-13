function Field(canvas) {
  this.canvas = canvas;
  this.piece = null;
  this.outputID = "";
  this.idX = 0;
  this.idY = 0;
  this.posX = 0;
  this.posY = 0;
  this.size = P4WN_SQUARE_HEIGHT;
  this.color = "";
}

Field.prototype.setPiece = function(piece) {
    this.piece = piece;
    if (this.piece != null) {
      var bounds = this.size * 0.2 * 0.5;
      this.piece.setPosition(this.posX + bounds, this.posY + bounds);
      this.piece.setID(this.idX, this.idY);
    }
};

Field.prototype.setOutputID = function(fieldID) {
  this.outputID = fieldID;
};

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
};

Field.prototype.setColor = function(fieldColor) {
  if (fieldColor == "Ivory" || fieldColor == "BurlyWood") {
    this.color = fieldColor;
  }
};

Field.prototype.draw = function() {
  var ctx = this.canvas.getContext("2d");
  ctx.save();
  ctx.fillStyle = this.color;
  ctx.fillRect(this.posX, this.posY, this.size, this.size);
  ctx.fill();
  ctx.restore();
  //if (this.piece != null) {
    //this.piece.draw(this.canvas);
  //}
};
