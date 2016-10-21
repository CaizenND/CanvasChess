function EditorStartListener(evt) {
  var board = this.frontEnd.chessboard;
  var canvas = board.canvas;

  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  if (mouseX >= 0 && mouseX <= board.posX) {
    for (var i = 0; i < this.pieces.length; i++) {
      var piece = this.pieces[i];
      if (mouseX >= piece.posX && mouseX <= piece.posX + piece.size
        && mouseY >= piece.posY && mouseY <= piece.posY + piece.size) {
          canvas.dragging = true;
          canvas.dragHoldX = mouseX - piece.posX;
          canvas.dragHoldY = mouseY - piece.posY;
          canvas.draggedPiece = new Piece(piece.color, piece.type, canvas);
          canvas.draggedPiece.setPosition(piece.posX, piece.posY);
          canvas.draggedPiece.setSize(piece.size);
          canvas.draggedPiece.setID(piece.idX, piece.idY)
          canvas.draggedPiece.loadImage();
      }
    }
  } else if (mouseX >= board.posX && mouseX <= board.posX + board.width
    && mouseY >= board.posY && mouseY <= board.posY + board.height) {
      for (var i = 0; i < board.pieces.length; i++) {
        var piece = board.pieces[i];
        if (mouseX >= piece.posX && mouseX <= piece.posX + piece.size
          && mouseY >= piece.posY && mouseY <= piece.posY + piece.size) {
            canvas.dragging = true;
            canvas.dragHoldX = mouseX - piece.posX;
            canvas.dragHoldY = mouseY - piece.posY;
            canvas.draggedPiece = piece;
            break;
        }
      }
  }

  if (canvas.dragging) {
    var interactionListener = canvas.interactionListener;
    interactionListener.moveListener = EditorMoveListener.bind(this);
    canvas.addEventListener("mousemove", interactionListener.moveListener, false);
    canvas.removeEventListener("mouseup", interactionListener.startListener, false);
    interactionListener.startListener = null;
    interactionListener.targetListener = EditorTargetListener.bind(this);
    canvas.startEvent = evt;
    canvas.addEventListener("mouseup", interactionListener.targetListener, false);
  }

  return false;
}

function EditorMoveListener(evt) {
  var board = this.frontEnd.chessboard;
  var canvas = board.canvas;
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

  this.draw();
  board.draw();

  return false;
}

function EditorTargetListener(evt) {
  var board = this.frontEnd.chessboard;
  var canvas = board.canvas;

  if (canvas.startEvent != evt) {

    var bRect = canvas.getBoundingClientRect();
    mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
    mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

    if (board.pieces.includes(canvas.draggedPiece)) {
        // remove piece from arry containing all pieces on board
        var index = board.pieces.indexOf(canvas.draggedPiece);
        board.pieces.splice(index, 1);
    }

    var piece = canvas.draggedPiece;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var currentField = board.fields[i][j];

        // search starting field
        if (currentField.piece == piece) {
          currentField.piece = null;
        }

        // search target field
        if (mouseX >= currentField.posX && mouseX <= currentField.posX + currentField.size
          && mouseY >= currentField.posY && mouseY <= currentField.posY + currentField.size) {
            if (currentField.piece != null) {
              var index = board.pieces.indexOf(currentField.piece);
              board.pieces.splice(index, 1);
            }
            currentField.setPiece(canvas.draggedPiece);
            if (!board.pieces.includes(canvas.draggedPiece)) {
              board.pieces.push(canvas.draggedPiece);
            }
        }
      }
    }
  }

  var interactionListener = canvas.interactionListener;
  canvas.removeEventListener("mousemove", interactionListener.moveListener, false);
  interactionListener.moveListener = null;
  canvas.removeEventListener("mouseup", interactionListener.targetListener, false);
  interactionListener.targetListener = null;
  interactionListener.startListener = EditorStartListener.bind(this);
  canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);

  canvas.dragging = false;
  canvas.draggedPiece = null;
  this.draw();
  board.draw();
  this.checkRochade();

  return false;
}
