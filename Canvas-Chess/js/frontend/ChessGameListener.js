function GameStartListenerDown(evt) {
  var board = this.chessboard;
  var canvas = board.canvas;

  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  for (var i = 0; i < board.pieces.length; i++) {
    var piece = board.pieces[i];
    if (mouseX >= piece.posX && mouseX <= piece.posX + piece.size
      && mouseY >= piece.posY && mouseY <= piece.posY + piece.size) {
        board.dragging.dragHoldX = mouseX - piece.posX;
        board.dragging.dragHoldY = mouseY - piece.posY;
        board.dragging.draggedPiece = piece;
        break;
    }
  }

  if (board.dragging.draggedPiece != null) {
    var interactionListener = canvas.interactionListener;
    interactionListener.moveListener = GameMoveListener.bind(this);
    canvas.addEventListener("mousemove", interactionListener.moveListener, false);
    canvas.removeEventListener("mousedown", interactionListener.startListener, false);
    interactionListener.startListener = null;
    interactionListener.targetListener = GameTargetListener.bind(this);
    canvas.addEventListener("mouseup", interactionListener.targetListener, false);
  }

  return false;
}

function GameStartListenerUp(evt) {
  var board = this.chessboard;
  var canvas = board.canvas;

  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  for (var i = 0; i < board.pieces.length; i++) {
    var piece = board.pieces[i];
    if (mouseX >= piece.posX && mouseX <= piece.posX + piece.size
      && mouseY >= piece.posY && mouseY <= piece.posY + piece.size) {
        board.dragging.dragHoldX = mouseX - piece.posX;
        board.dragging.dragHoldY = mouseY - piece.posY;
        board.dragging.draggedPiece = piece;
        break;
    }
  }

  if (board.dragging.draggedPiece != null) {
    var interactionListener = canvas.interactionListener;
    interactionListener.moveListener = GameMoveListener.bind(this);
    canvas.addEventListener("mousemove", interactionListener.moveListener, false);
    canvas.removeEventListener("mouseup", interactionListener.startListener, false);
    interactionListener.startListener = null;
    interactionListener.targetListener = GameTargetListener.bind(this);
    interactionListener.startEvent = evt;
    canvas.addEventListener("mouseup", interactionListener.targetListener, false);
  }

  return false;
}

function GameMoveListener(evt) {
  var board = this.chessboard;
  var canvas = board.canvas;
  var posX;
  var posY;
  var shapeRad = board.dragging.draggedPiece.size;
  var minX = 0;
  var maxX = canvas.width - shapeRad;
  var minY = 0;
  var maxY = canvas.height - shapeRad;

  //getting mouse position correctly
  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  //clamp x and y positions to prevent object from dragging outside of canvas
  posX = mouseX - board.dragging.dragHoldX;
  posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
  posY = mouseY - board.dragging.dragHoldY;
  posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);

  board.dragging.draggedPiece.posX = posX;
  board.dragging.draggedPiece.posY = posY;

  canvas.draw();

  return false;
}

function GameTargetListener(evt) {
  var board = this.chessboard;
  var canvas = board.canvas;

  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  var interactionListener = canvas.interactionListener;

  if (interactionListener.startEvent != evt) {

    if (mouseX >= board.posX && mouseX <= board.posX + board.width
      && mouseY >= board.posY && mouseY <= board.posY + board.height) {

        var piece = board.dragging.draggedPiece;
        var startField = null;
        var targetField = null;
        for (var i = 0; i < 8; i++) {
          for (var j = 0; j < 8; j++) {
            var currentField = board.fields[i][j];

            // search starting field to get id
            if (currentField.piece == piece) {
              startField = currentField;
            }

            // search target field to get id
            if (mouseX >= currentField.posX && mouseX <= currentField.posX + currentField.size
              && mouseY >= currentField.posY && mouseY <= currentField.posY + currentField.size) {
                targetField = currentField;
            }
          }
        }

        if (targetField != null) {
          var moveResult = this.move(startField.algebraicID, targetField.algebraicID);
        }
      }

    canvas.removeEventListener("mousemove", interactionListener.moveListener, false);
    interactionListener.moveListener = null;
    canvas.removeEventListener("mouseup", interactionListener.targetListener, false);
    interactionListener.targetListener = null;
    if (this.interactionMode == 1) {
      interactionListener.startListener = GameStartListenerDown.bind(this);
      canvas.addEventListener("mousedown", canvas.interactionListener.startListener, false);
    } else if (this.interactionMode == 2) {
      interactionListener.startListener = GameStartListenerUp.bind(this);
      canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
    }
    interactionListener.startEvent = null;
    board.dragging.draggedPiece = null;
    this.refresh();
  }

  return false;
}
