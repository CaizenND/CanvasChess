function createCanvas() {
  var canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.id     = "Chessboard";
  canvas.width  = 800;
  canvas.height = 800;
  canvas.style.position = "absolute";
  canvas.style.border   = "1px solid";
  var board = new Chessboard(canvas);
  board.create();
  canvas.board = board;
  window.chessCanvas = canvas;
  canvas.addEventListener("mousedown", mouseDownListener, false);
}
