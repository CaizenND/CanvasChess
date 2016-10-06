function mouseDownListenerStart(evt) {
  var board = this.chessboard;
  var canvas = board.canvas;

  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  for (var i = 0; i < board.pieces.length; i++) {
    var piece = board.pieces[i];
    if (mouseX >= piece.posX && mouseX <= piece.posX + piece.size
      && mouseY >= piece.posY && mouseY <= piece.posY + piece.size) {
        canvas.dragging = true;
        canvas.dragHoldX = mouseX - piece.posX;
        canvas.dragHoldY = mouseY - piece.posY;
        canvas.draggedPiece = piece;
    }
  }

  if (canvas.dragging) {
    var interactionListener = canvas.interactionListener;
    interactionListener.moveListener = mouseMoveListener.bind(this);
    window.addEventListener("mousemove", interactionListener.moveListener, false);
    canvas.removeEventListener("mousedown", interactionListener.startListener, false);
    interactionListener.startListener = null;
    interactionListener.targetListener = mouseUpListenerTarget.bind(this);
    window.addEventListener("mouseup", interactionListener.targetListener, false);
  }
  return false;
}

function mouseUpListenerStart(evt) {
  var board = this.chessboard;
  var canvas = board.canvas;

  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  for (var i = 0; i < board.pieces.length; i++) {
    var piece = board.pieces[i];
    if (mouseX >= piece.posX && mouseX <= piece.posX + piece.size
      && mouseY >= piece.posY && mouseY <= piece.posY + piece.size) {
        canvas.dragging = true;
        canvas.dragHoldX = mouseX - piece.posX;
        canvas.dragHoldY = mouseY - piece.posY;
        canvas.draggedPiece = piece;
    }
  }
  if (canvas.dragging) {
    var interactionListener = canvas.interactionListener;
    interactionListener.moveListener = mouseMoveListener.bind(this);
    window.addEventListener("mousemove", interactionListener.moveListener, false);
    canvas.removeEventListener("mouseup", interactionListener.startListener, false);
    interactionListener.startListener = null;
    interactionListener.targetListener = mouseUpListenerTarget.bind(this);
    canvas.startEvent = evt;
    window.addEventListener("mouseup", interactionListener.targetListener, false);
  }
  return false;
}

function mouseMoveListener(evt) {
  var board = this.chessboard;
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

  board.draw();
}

function mouseUpListenerTarget(evt) {
  var board = this.chessboard;
  var canvas = board.canvas;
  if (canvas.startEvent != evt) {
    var piece = canvas.draggedPiece;
    var startField = null;
    var targetField = null;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var currentField = board.fields[i][j];
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
    if (targetField != null) {
      var interactionListener = canvas.interactionListener;
      window.removeEventListener("mousemove", interactionListener.moveListener, false);
      interactionListener.moveListener = null;
      window.removeEventListener("mouseup", interactionListener.targetListener, false);
      interactionListener.targetListener = null;
      if (this.interactionStyle == 1) {
        interactionListener.startListener = mouseDownListenerStart.bind(this);
        canvas.addEventListener("mousedown", canvas.interactionListener.startListener, false);
      } else if (this.interactionStyle == 2) {
        interactionListener.startListener = mouseUpListenerStart.bind(this);
        canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
      }
      var moveResult = this.move(startField.algebraicID, targetField.algebraicID);
      if (!moveResult) {
        startField.setPiece(canvas.draggedPiece);
      }
      canvas.dragging = false;
      canvas.draggedPiece = null;
      this.refresh();
    }

  }
}
