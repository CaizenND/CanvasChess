
/**
 * Mouse-up listener
 * Tries to find the clicked piece (from the editor- or the chessboard-area) and
 * marks it as dragged. Creates a new piece objekt and adds it to the chessboard
 * if piece in editor area was clicked.
 * Note: "this" has to be bound to the frontend objekt.
 * @param evt   Mouse event that triggered the listener
 * @return false
 */
function EditorStartListener(evt) {
  var canvas = this.canvas;
  var pieces = this.boardEditor.pieces;

  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  if (mouseX >= 0 && mouseX <= this.chessboard.posX) {
    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
      if (mouseX >= piece.posX && mouseX <= piece.posX + piece.size
        && mouseY >= piece.posY && mouseY <= piece.posY + piece.size) {
          this.chessboard.dragging.dragHoldX = mouseX - piece.posX;
          this.chessboard.dragging.dragHoldY = mouseY - piece.posY;
          var newPiece = new Piece(piece.color, piece.type, this.chessboard);
          newPiece.setPosition(piece.posX, piece.posY);
          newPiece.setSize(piece.size);
          newPiece.loadImage(canvas);
          this.chessboard.dragging.draggedPiece = newPiece;
      }
    }
  } else if (mouseX >= this.chessboard.posX && mouseX <= this.chessboard.posX + this.chessboard.width
    && mouseY >= this.chessboard.posY && mouseY <= this.chessboard.posY + this.chessboard.height) {
      for (var i = 0; i < this.chessboard.pieces.length; i++) {
        var piece = this.chessboard.pieces[i];
        if (mouseX >= piece.posX && mouseX <= piece.posX + piece.size
          && mouseY >= piece.posY && mouseY <= piece.posY + piece.size) {
            this.chessboard.dragging.dragHoldX = mouseX - piece.posX;
            this.chessboard.dragging.dragHoldY = mouseY - piece.posY;
            this.chessboard.dragging.draggedPiece = piece;
            break;
        }
      }
  }

  if (this.chessboard.dragging.draggedPiece != null) {
    var interactionListener = canvas.interactionListener;
    interactionListener.moveListener = EditorMoveListener.bind(this);
    canvas.addEventListener("mousemove", interactionListener.moveListener, false);
    canvas.removeEventListener("mouseup", interactionListener.startListener, false);
    interactionListener.startListener = null;
    interactionListener.targetListener = EditorTargetListener.bind(this);
    interactionListener.startEvent = evt;
    canvas.addEventListener("mouseup", interactionListener.targetListener, false);
  }

  return false;
};

/**
 * Mouse-move listener
 * Recalculates the position of the dragged piece.
 * Triggers a redraw of the canvas.
 * Note: "this" has to be bound to the frontend objekt.
 * @param evt   Mouse event that triggered the listener
 * @return false
 */
function EditorMoveListener(evt) {
  var canvas = this.canvas;

  var posX;
  var posY;
  var shapeRad = this.chessboard.dragging.draggedPiece.size;
  var minX = 0;
  var maxX = canvas.width - shapeRad;
  var minY = 0;
  var maxY = canvas.height - shapeRad;

  //getting mouse position correctly
  var bRect = canvas.getBoundingClientRect();
  mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
  mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

  //clamp x and y positions to prevent object from dragging outside of canvas
  posX = mouseX - this.chessboard.dragging.dragHoldX;
  posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
  posY = mouseY - this.chessboard.dragging.dragHoldY;
  posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);

  this.chessboard.dragging.draggedPiece.posX = posX;
  this.chessboard.dragging.draggedPiece.posY = posY;

  canvas.draw()

  return false;
};

/**
 * Mouse-up listener
 * Tries to find the start- and target-field for the current editor action.
 * Removes the piece reference from the start field (if available) and adds it
 * to the target field.
 * Triggers a redraw of the canvas.
 * Updates editor controls with possible castling moves.
 * Note: "this" has to be bound to the frontend objekt.
 * @param evt   Mouse event that triggered the listener
 * @return false
 */
function EditorTargetListener(evt) {
  var canvas = this.canvas;
  var interactionListener = canvas.interactionListener;

  if (interactionListener.startEvent != evt) {

    var bRect = canvas.getBoundingClientRect();
    mouseX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
    mouseY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);

    if (this.chessboard.pieces.includes(this.chessboard.dragging.draggedPiece)) {
        // remove piece from arry containing all pieces on board
        var index = this.chessboard.pieces.indexOf(this.chessboard.dragging.draggedPiece);
        this.chessboard.pieces.splice(index, 1);
    }

    var piece = this.chessboard.dragging.draggedPiece;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        var currentField = this.chessboard.fields[i][j];

        // search starting field
        if (currentField.piece == piece) {
          currentField.piece = null;
        }

        // search target field
        if (mouseX >= currentField.posX && mouseX <= currentField.posX + currentField.size
          && mouseY >= currentField.posY && mouseY <= currentField.posY + currentField.size) {
            if (currentField.piece != null) {
              var index = this.chessboard.pieces.indexOf(currentField.piece);
              this.chessboard.pieces.splice(index, 1);
            }
            currentField.setPiece(this.chessboard.dragging.draggedPiece);
            if (!this.chessboard.pieces.includes(this.chessboard.dragging.draggedPiece)) {
              this.chessboard.pieces.push(this.chessboard.dragging.draggedPiece);
            }
        }
      }
    }
  }

  canvas.removeEventListener("mousemove", interactionListener.moveListener, false);
  interactionListener.moveListener = null;
  canvas.removeEventListener("mouseup", interactionListener.targetListener, false);
  interactionListener.targetListener = null;
  interactionListener.startListener = EditorStartListener.bind(this);
  canvas.addEventListener("mouseup", canvas.interactionListener.startListener, false);
  interactionListener.startEvent = null;

  this.chessboard.dragging.draggedPiece = null;
  canvas.draw();
  var castling = this.chessboard.checkCastling();
  this.boardEditor.updateCastlingOptions(castling);

  return false;
};
