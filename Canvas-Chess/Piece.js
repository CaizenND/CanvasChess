function Piece(pieceColor, pieceType, canvas) {
  this.color = pieceColor;
  this.type = pieceType;
  //this.captured = false;
  this.canvas = canvas;
  this.image = new Image();
  this.idX = 0;
  this.idY = 0;
  this.posX = 0;
  this.posY = 0;
  this.size = 24;
}

Piece.prototype.setPosition = function(x, y) {
  this.posX = x;
  this.posY = y;
}

Piece.prototype.setSize = function(size) {
  this.size = size;
}

Piece.prototype.setID = function(x, y) {
  this.idX = x;
  this.idY = y;
}

Piece.prototype.draw = function() {
  var ctx = this.canvas.getContext("2d");
  ctx.save();
  if (this.canvas.draggedPiece == this) {
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  ctx.drawImage(this.image, this.posX, this.posY, this.size, this.size);
  ctx.restore();
};

Piece.prototype.loadImage = function() {
  this.image.onload = (function(piece) {
    return function() {
      piece.draw();
    };
  })(this);
  var imgPath = "img/" + this.color + "_" + this.type + ".gif";
  this.image.src = imgPath;
}
