var ctx;

function createCanvas() {
  var canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.id     = "Chessboard";
  canvas.width  = 800;
  canvas.height = 800;
  canvas.style.position = "absolute";
  canvas.style.border   = "1px solid";
  ctx = canvas.getContext("2d");
}

function createBoard() {
  ctx.fillStyle = "Ivory";
  ctx.fillRect(0,0,800,800);
  ctx.fill();

  ctx.fillStyle = "BurlyWood";
  for (i = 0; i < 8; i++) {
    for (j = 0; j < 8; j++) {
      if ((i+j)%2 == 1) {
        ctx.fillRect(j * 100,i * 100,100,100);
      }
      if (i < 2 || i > 5) {
        var img = null;
        if (i == 0) {
          if (j == 0 || j == 7) {
            img = document.getElementById("black_rook");
          }
          if (j == 1 || j == 6) {
            img = document.getElementById("black_knight");
          }
          if (j == 2 || j == 5) {
            img = document.getElementById("black_bishop");
          }
          if (j == 3) {
            img = document.getElementById("black_queen");
          }
          if (j == 4) {
            img = document.getElementById("black_king");
          }
        }
        if (i == 1) {
          img = document.getElementById("black_pawn");
        }
        if (i == 6) {
          img = document.getElementById("white_pawn");
        }
        if (i == 7) {
          if (j == 0 || j == 7) {
            img = document.getElementById("white_rook");
          }
          if (j == 1 || j == 6) {
            img = document.getElementById("white_knight");
          }
          if (j == 2 || j == 5) {
            img = document.getElementById("white_bishop");
          }
          if (j == 3) {
            img = document.getElementById("white_queen");
          }
          if (j == 4) {
            img = document.getElementById("white_king");
          }
        }
        ctx.drawImage(img, j * 100 + 10, i * 100 + 10, 80, 80)
      }
    }
  }
}
