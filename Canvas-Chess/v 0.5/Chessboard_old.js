function Chessboard(canvas) {
  this.canvas = canvas;
  this.fields = [];
  this.pieces = [];
}

Chessboard.prototype.create = function() {
  var ctx = this.canvas.getContext("2d");

  this.fields = new Array(8);
  for (var i = 0; i < 8; i++) {
    this.fields[i] = new Array();
  }
  for ( var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var field = new Field(this.canvas);
      this.fields[i].push(field);
      var fieldID = "";
      switch (j) {
        case 0: fieldID = "a"; break;
        case 1: fieldID = "b"; break;
        case 2: fieldID = "c"; break;
        case 3: fieldID = "d"; break;
        case 4: fieldID = "e"; break;
        case 5: fieldID = "f"; break;
        case 6: fieldID = "g"; break;
        case 7: fieldID = "h"; break;
      }
      fieldID += (8-i);
      field.setOutputID(fieldID);
      field.setID(j+1,i+1);
      field.setPosition(j*60, i*60);
      if ((i+j)%2 == 1) {
        field.setColor("BurlyWood");
      } else {
        field.setColor("Ivory");
      }
      field.draw();

      if (i < 2 || i > 5) {
        var piece = null;
        if (i == 0) {
          if (j == 0 || j == 7) {
            piece = new Piece("black", "rook", this.canvas);
          }
          if (j == 1 || j == 6) {
            piece = new Piece("black", "knight", this.canvas);
          }
          if (j == 2 || j == 5) {
            piece = new Piece("black", "bishop", this.canvas);
          }
          if (j == 3) {
            piece = new Piece("black", "queen", this.canvas);
          }
          if (j == 4) {
            piece = new Piece("black", "king", this.canvas);
          }
        }
        if (i == 1) {
          piece = new Piece("black", "pawn", this.canvas);
        }
        if (i == 6) {
          piece = new Piece("white", "pawn", this.canvas);
        }
        if (i == 7) {
          if (j == 0 || j == 7) {
            piece = new Piece("white", "rook", this.canvas);
          }
          if (j == 1 || j == 6) {
            piece = new Piece("white", "knight", this.canvas);
          }
          if (j == 2 || j == 5) {
            piece = new Piece("white", "bishop", this.canvas);
          }
          if (j == 3) {
            piece = new Piece("white", "queen", this.canvas);
          }
          if (j == 4) {
            piece = new Piece("white", "king", this.canvas);
          }
        }
        piece.loadImage();
        this.pieces.push(piece);
        field.setPiece(piece);
      }
    }
  }
};

Chessboard.prototype.switchPositions = function() {
  for (var i = 0; i < this.pieces.length; i++) {
    var currentPiece = this.pieces[i];
    if (currentPiece.captured == false) {
      var switchedIDX = 7 - currentPiece.idX;
      var switchedIDY = 7 - currentPiece.idY;
      this.fields[switchedIDY][switchedIDX].setPiece(currentPiece);
    }
  }
}

Chessboard.prototype.draw = function() {
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      this.fields[i][j].draw();
    }
  }
  for (var i = 0; i < this.pieces.length; i++) {
    this.pieces[i].draw();
  }
};

Chessboard.prototype.makeMove = function(startField, targetField) {
  var piece = startField.piece;
  if (this.checkMove(startField, targetField) == true) {
    var outputString = "";
    startField.piece = null;
    if (targetField.piece != null) {
      targetField.piece.captured = true;
      outputString =  " [" + targetField.piece.color + " " + targetField.piece.type + " captured]";
    }
    targetField.setPiece(piece);
    piece.startingPosition = false;
    outputString = piece.color + " " + piece.type + ": " + startField.outputID + " -> " + targetField.outputID + outputString;
    console.log(outputString);
  } else {
    startField.piece = null;
    startField.setPiece(piece);
  }
};

Chessboard.prototype.convertNotation = function(p4wnFieldID) {
  var id = p4wnFieldID - 10;
  var idY = Math.floor(id / 10);
  var idX = id - (idY*10);
  var fieldID = "";
  switch (idX) {
    case 1: fieldID = "a"; break;
    case 2: fieldID = "b"; break;
    case 3: fieldID = "c"; break;
    case 4: fieldID = "d"; break;
    case 5: fieldID = "e"; break;
    case 6: fieldID = "f"; break;
    case 7: fieldID = "g"; break;
    case 8: fieldID = "h"; break;
  }
  fieldID += idY;
  console.log(fieldID + " - " + id);
  return this.fields[7-(idY-1)][7-idX];
};

Chessboard.prototype.checkMove = function(startField, targetField) {
  var piece = startField.piece;
  var valid = false;
  switch (piece.type) {
    case "pawn": valid = this.checkPawnMove(startField, targetField, false); break;
    case "rook": valid = this.checkRookMove(startField, targetField, false); break;
    case "knight": valid = this.checkKnightMove(startField, targetField, false); break;
    case "bishop": valid = this.checkBishopMove(startField, targetField, false); break;
    case "queen": valid = this.checkQueenMove(startField, targetField, false); break;
    case "king": valid = this.checkKingMove(startField, targetField, false); break;
    defaut: break;
  }
  return valid;
};

Chessboard.prototype.checkPawnMove = function(startField, targetField, targetIsEmpty) {
  var piece = startField.piece;
  var direction = 1;
  if (piece.color == "white") {
    direction = -1;
  }

  if (targetIsEmpty) {
    if (startField.idY + (direction*1) == targetField.idY && Math.abs(startField.idX - targetField.idX) == 1) {
      return true;
    }
  } else {
    if (targetField.piece == null) {
      if (piece.startingPosition == true && startField.idY + (direction*2) == targetField.idY
      && startField.idX == targetField.idX) {
        return true;
      }
      if (startField.idY + (direction*1) == targetField.idY && startField.idX == targetField.idX) {
        return true;
      }
    } else {
      if (startField.idY + (direction*1) == targetField.idY && Math.abs(startField.idX - targetField.idX) == 1
      && piece.color != targetField.piece.color) {
        return true;
      }
    }
  }
  return false;
};

Chessboard.prototype.checkRookMove = function(startField, targetField, targetIsEmpty) {
  var piece = startField.piece;
  if ((startField.idX != targetField.idX && startField.idY == targetField.idY)
    || (startField.idX == targetField.idX && startField.idY != targetField.idY)) {
      var validPath = true;
      // rechts / unten
      var direction = 1;
      if (startField.idX != targetField.idX && startField.idY == targetField.idY) {
        // links
        if (startField.idX > targetField.idX) {
          direction = -1;
        }
        for (var i = 1; Math.abs((startField.idX + (direction*i)) - targetField.idX) > 0; i++) {
          if (this.fields[startField.idY][startField.idX + (direction*i)].piece != null) {
            validPath = false;
          }
        }
      } else {
        // oben
        if (startField.idY > targetField.idY) {
          direction = -1;
        }
        for (var i = 1; Math.abs((startField.idY + (direction*i)) - targetField.idY) > 0; i++) {
          if (this.fields[startField.idY + (direction*i)][startField.idX].piece != null) {
            validPath = false;
          }
        }
      }

      if (targetIsEmpty) {
        if (validPath == true) {
          return true;
        }
      } else {
        if (validPath == true && (targetField.piece == null || piece.color != targetField.piece.color)) {
          return true;
        }
      }
  }
  return false;
};

Chessboard.prototype.checkKnightMove = function(startField, targetField, targetIsEmpty) {
  var piece = startField.piece;
  if ((Math.abs(startField.idX - targetField.idX) == 2 && Math.abs(startField.idY - targetField.idY) == 1)
    || (Math.abs(startField.idX - targetField.idX) == 1 && Math.abs(startField.idY - targetField.idY) == 2)) {
      if (targetIsEmpty) {
        return true;
      } else {
        if (targetField.piece == null || piece.color != targetField.piece.color) {
          return true;
        }
      }
  }
  return false;
};

Chessboard.prototype.checkBishopMove = function(startField, targetField, targetIsEmpty) {
  var piece = startField.piece;
  if (startField.idX != targetField.idX
    && Math.abs(startField.idX - targetField.idX) == Math.abs(startField.idY - targetField.idY)) {
      var validPath = true;
      // rechts
      var directionX = 1;
      // oben
      var directionY = 1;
      // links
      if (startField.idX > targetField.idX) {
        directionX = -1;
      }
      // unten
      if (startField.idY > targetField.idY) {
        directionY = -1;
      }
      for (var i = 1; Math.abs((startField.idX + (directionX*i)) - targetField.idX) > 0; i++) {
        if (this.fields[startField.idY + (directionY*i)][startField.idX + (directionX*i)].piece != null) {
          validPath = false;
        }
      }

      if (targetIsEmpty) {
        if (validPath == true) {
          return true;
        }
      } else {
        if (validPath == true && (targetField.piece == null || piece.color != targetField.piece.color)) {
          return true;
        }
      }
  }
  return false;
};

Chessboard.prototype.checkQueenMove = function(startField, targetField, targetIsEmpty) {
  if (this.checkRookMove(startField, targetField, targetIsEmpty) || this.checkBishopMove(startField, targetField, targetIsEmpty)) {
    return true;
  }
  return false;
};

Chessboard.prototype.checkKingMove = function(startField, targetField, targetIsEmpty) {

  if (targetIsEmpty) {
    if (Math.abs(startField.idX - targetField.idX) + Math.abs(startField.idY - targetField.idY) <= 2) {
      return true;
    } else {
      return false;
    }
  }

  var legalFields = this.getLegalKingMoves(startField);
  for (var i = 0; i < legalFields.length; i++) {
    if (legalFields[i] == targetField) {
      return true;
    }
  }
  return false;
};

Chessboard.prototype.getLegalKingMoves = function(field) {
  var piece = field.piece;
  var legalFields = [];
  for (var i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {
      if (!(i == 0 && j == 0 || field.idX + j < 0 || field.idY + i < 0 || field.idX + j >= 8 || field.idY + i >= 8)) {
        var checkField = this.fields[field.idY+i][field.idX+j];
        if (checkField.piece == null || piece.color != checkField.piece.color) {
          var legal = true;
          for (var k = 0; k < 8; k++) {
            for (var l = 0; l < 8; l++) {
              var currentField = this.fields[k][l];
              if (currentField.piece != null && piece.color != currentField.piece.color) {
                if (this.checkCapture(currentField, checkField)) {
                  legal = false;
                }
              }
            }
          }
          if (legal) {
            legalFields.push(checkField);
          }
        }
      }
    }
  }
  return legalFields;
};

Chessboard.prototype.checkCapture = function(startField, targetField) {
  var piece = startField.piece;
  var valid = false;
  switch (piece.type) {
    case "pawn": valid = this.checkPawnMove(startField, targetField, true); break;
    case "rook": valid = this.checkRookMove(startField, targetField, true); break;
    case "knight": valid = this.checkKnightMove(startField, targetField, true); break;
    case "bishop": valid = this.checkBishopMove(startField, targetField, true); break;
    case "queen": valid = this.checkQueenMove(startField, targetField, true); break;
    case "king": valid = this.checkKingMove(startField, targetField, true); break;
    defaut: break;
  }
  return valid;
};


function mouseDownListener(evt) {
  var canvas = window.chessCanvas;
  var board = canvas.chessboard;

  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  for (var i = 0; i < board.pieces.length; i++) {
    var piece = board.pieces[i];
    if (mouseX >= piece.posX && mouseX <= piece.posX + piece.size
      && mouseY >= piece.posY && mouseY <= piece.posY + piece.size
      && piece.captured == false) {
        canvas.dragging = true;
        canvas.dragHoldX = mouseX - piece.posX;
        canvas.dragHoldY = mouseY - piece.posY;
        canvas.draggedPiece = piece;
      }
  }

  if (canvas.dragging) {
    window.addEventListener("mousemove", mouseMoveListener, false);
  }
  canvas.removeEventListener("mousedown", mouseDownListener, false);
  window.addEventListener("mouseup", mouseUpListener, false);
  return false;
}

function mouseUpListener(evt) {
  var canvas = window.chessCanvas;
  canvas.addEventListener("mousedown", mouseDownListener, false);
  window.removeEventListener("mouseup", mouseUpListener, false);
  if (canvas.dragging) {
    var piece = canvas.draggedPiece;
    var startField = null;
    var targetField = null;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var currentField = canvas.chessboard.fields[i][j];
        var bRect = canvas.getBoundingClientRect();
        mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
        mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

        if (currentField.piece == piece) {
          startField = currentField;
        }
        if (mouseX >= currentField.posX && mouseX <= currentField.posX + currentField.size
          && mouseY >= currentField.posY && mouseY <= currentField.posY + currentField.size) {
            targetField = currentField;
          }
      }
    }

    canvas.chessboard.makeMove(startField, targetField);
    game.move(startField.outputID, targetField.outputID);
    canvas.chessboard.draw();
    canvas.dragging = false;
    canvas.draggedPiece = null;
    window.removeEventListener("mousemove", mouseMoveListener, false);
  }
}

function mouseMoveListener(evt) {
  var canvas = window.chessCanvas;
  var posX;
  var posY;
  var shapeRad = canvas.draggedPiece.size;
  var minX = 0;
  var maxX = canvas.width - shapeRad;
  var minY = 0;
  var maxY = canvas.height - shapeRad;
  //getting mouse position correctly
  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  //clamp x and y positions to prevent object from dragging outside of canvas
  posX = mouseX - canvas.dragHoldX;
  posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
  posY = mouseY - canvas.dragHoldY;
  posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);

  canvas.draggedPiece.posX = posX;
  canvas.draggedPiece.posY = posY;

  canvas.chessboard.draw();
}
