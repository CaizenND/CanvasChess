
/* This code is based on p4wn, AKA 5k chess
 * by Douglas Bagnall <douglas@paradise.net.nz>
 *
 * modified by Nils Dechant & Felix Buhlert
 * to use a canvas to display the chessboard
 *
 * This code is in the public domain, or as close to it as various
 * laws allow. No warranty; no restrictions.
 *
 * lives at http://p4wn.sf.net/
 *
 * @author Douglas Bagnall <douglas@paradise.net.nz>
 * @author Oliver Merkel <merkel.oliver@web.de>
 * @author Nils Dechant
 * @author Felix Buhlert
 */

/* The routines here draw the screen, using a canvas element,
 * and handle user interaction
 */

// Übernommen
var P4WN_SQUARE_HEIGHT = 40;
var P4WN_SQUARE_WIDTH = P4WN_SQUARE_HEIGHT;

// Eigene
var P4WN_BOARD_OFFSET_TOP = P4WN_SQUARE_HEIGHT*0.8;
var P4WN_BOARD_OFFSET_LEFT = P4WN_SQUARE_WIDTH*0.8;

var P4WN_WRAPPER_CLASS = 'p4wn-wrapper';
var P4WN_BOARD_CLASS = 'p4wn-board';
var P4WN_MESSAGES_CLASS = 'p4wn-messages';
var P4WN_LOG_CLASS = 'p4wn-log';
var P4WN_CONTROLS_CLASS = 'p4wn-controls';
var P4WN_BLACK_SQUARE = 'p4wn-black-square';
var P4WN_WHITE_SQUARE = 'p4wn-white-square';

var P4WN_ROTATE_BOARD = true;
var P4WN_LEVELS = ['stupid', 'middling', 'default', 'slow', 'slowest'];
var P4WN_DEFAULT_LEVEL = 2;
var P4WN_ADAPTIVE_LEVELS = false;

var P4WN_IMAGE_DIR = 'img';

var P4WN_PROMOTION_STRINGS = ['queen', 'rook', 'knight', 'bishop'];
var P4WN_PROMOTION_INTS = [P4_QUEEN, P4_ROOK, P4_KNIGHT, P4_BISHOP];

var _p4d_proto = {};

/* MSIE 6 compatibility functions */
function _add_event_listener(el, eventname, fn) {
  if (el.addEventListener === undefined) {
    el.attachEvent('on' + eventname, fn);
  } else {
    el.addEventListener(eventname, fn);
  }
}

function _event_target(e) {
  /*e.srcElement is not quite equivalent, but nothing is closer */
  return (e.currentTarget) ? e.currentTarget : e.srcElement;
}

_p4d_proto.move = function(start, end, promotion) {
    var state = this.board_state;
    var move_result = state.move(start, end, promotion);
    if (move_result.ok) {
        this.display_move_text(state.moveno, move_result.string);
        this.refresh();
        if (! (move_result.flags & P4_MOVE_FLAG_MATE)) {
            this.next_move_timeout = window.setTimeout(
                function(p4d) {
                    return function() {
                        p4d.next_move();
                    };
                }(this), 1);
        }
    } else {
        p4_log("bad move!", start, end);
    }
    for (var i = 0; i < this.move_listeners.length; i++) {
        this.move_listeners[i](move_result);
    }
    return move_result.ok;
};

_p4d_proto.next_move = function()  {
  var mover = this.board_state.to_play;
  if (this.players[mover] == 'computer' &&
  this.auto_play_timeout === undefined) {
    var timeout = (this.players[1 - mover] == 'computer') ? 500: 10;
    var p4d = this;
    this.auto_play_timeout = window.setTimeout(function() {p4d.computer_move();},
    timeout);
  }
};

_p4d_proto.computer_move = function() {
    this.auto_play_timeout = undefined;
    var state = this.board_state;
    var mv;
    var depth = this.computer_level + 1;
    var start_time = Date.now();
    mv = state.findmove(depth);
    var delta = Date.now() - start_time;
    p4_log("findmove took", delta);
    if (P4WN_ADAPTIVE_LEVELS && depth > 2) {
        var min_time = 25 * depth;
        while (delta < min_time) {
            depth++;
            mv = state.findmove(depth);
            delta = Date.now() - start_time;
            p4_log("retry at depth", depth, " total time:", delta);
        }
    }
    this.move(mv[0], mv[1]);
    var start = this.elements.boardCanvas.chessboard.convertNotation(mv[0]);
    var target = this.elements.boardCanvas.chessboard.convertNotation(mv[1]);
    this.refresh();
    this.elements.boardCanvas.chessboard.draw();
};

_p4d_proto.display_move_text = function(moveno, string) {
    var mn;
    if ((moveno & 1) == 0) {
        mn = '    ';
    } else {
        mn = ((moveno >> 1) + 1) + ' ';
        while(mn.length < 4)
            mn = ' ' + mn;
    }
    this.log(mn + string, "p4wn-log-move",
             function (p4d, n) {
                 return function(e) {
                     p4d.goto_move(n);
                 };
             }(this, moveno));
};

_p4d_proto.log = function(msg, klass, onclick) {
    var div = this.elements.log;
    var item = p4d_new_child(div, "div");
    item.className = klass;
    if (onclick !== undefined) {
      _add_event_listener(item, "click", onclick);
    }
    item.innerHTML = msg;
    div.scrollTop = 999999;
};

_p4d_proto.goto_move = function(n) {
    var delta;
    if (n < 0) {
      delta = -n;
    } else {
      delta = this.board_state.moveno - n;
    }
    if (delta > this.board_state.moveno) {
      delta = this.board_state.moveno;
    }
    var div = this.elements.log;
    for (var i = 0; i < delta; i++) {
        div.removeChild(div.lastChild);
    }
    this.board_state.jump_to_moveno(n);
    this.refresh();
    this.next_move();
};

_p4d_proto.refresh = function() {
  this.elements.boardCanvas.chessboard.loadBoard(this.board_state);
  this.elements.boardCanvas.chessboard.draw();
};

function p4d_new_child(element, childtag, className) {
  var child = document.createElement(childtag);
  element.appendChild(child);
  if (className !== undefined) {
    child.className = className;
  }
  return child;
}

_p4d_proto.write_board_html = function() {
  var canvas = this.elements.boardCanvas;
  var chessboard = new Chessboard(canvas);
  chessboard.create();
  canvas.chessboard = chessboard;
  // Scheiß javascript !!!
  var passThis = this;
  var mouseDownListenerThis = function(evt) {
    mouseDownListener(evt, passThis, mouseDownListenerThis);
  };
  canvas.addEventListener("mousedown", mouseDownListenerThis, false);
};

_p4d_proto.refresh_buttons = function() {
  var rf = this.buttons.refreshers;
  for (var i = 0; i < rf.length; i++) {
    var x = rf[i];
    x[0].call(this, x[1]);
  }
};

_p4d_proto.maybe_rotate_board = function() {
  var p = this.players;
  if (p[0] != p[1] && P4WN_ROTATE_BOARD) {
    this.orientation = p[0] == 'computer' ? 1 : 0;
    this.elements.boardCanvas.chessboard.switchPositions(this.orientation);
    this.refresh();
  }
};

_p4d_proto.flip_player = function(i) {
  this.players[i] = (this.players[i] == 'human') ? 'computer' : 'human';
  this.refresh_buttons();
  this.maybe_rotate_board();
  this.next_move();
};

var P4WN_CONTROLS = [
  {/*white player */
    onclick_wrap: function(p4d) {
      return function(e) {
        p4d.flip_player(0);
      };
    },
    refresh: function(el) {
      var s = this.players[0];
      el.innerHTML = 'white <img src="' + P4WN_IMAGE_DIR + '/' + s + '.png" alt="' + s + '">';
    }
  },
  {/*black player */
    onclick_wrap: function(p4d) {
      return function(e) {
        p4d.flip_player(1);
      };
    },
    refresh: function(el) {
      var s = this.players[1];
      el.innerHTML = 'black <img src="' + P4WN_IMAGE_DIR + '/' + s + '.png" alt="' + s + '">';
    }
  },
  {/*swap sides */
    onclick_wrap: function(p4d) {
      return function(e) {
        var p = p4d.players;
        var tmp = p[0];
        p[0] = p[1];
        p[1] = tmp;
        if (p[0] != p[1] && P4WN_ROTATE_BOARD) {
          p4d.orientation = 1 - p4d.orientation;
        }
        p4d.refresh_buttons();
        p4d.maybe_rotate_board();
        p4d.next_move();
      };
    },
    refresh: function(el) {
      if (this.players[0] != this.players[1]) {
        el.innerHTML = '<b>swap</b>';
      } else {
        el.innerHTML = 'swap';
      }
    }
  },
  {/* undo*/
    onclick_wrap: function(p4d) {
      return function(e) {
        p4d.goto_move(-2);
      };
    },
    label: "<b>undo</i>"
  },
  {/* pawn promotion*/
    onclick_wrap: function(p4d) {
      return function(e) {
        var x = (p4d.pawn_becomes + 1) % P4WN_PROMOTION_STRINGS.length;
        p4d.pawn_becomes = x;
        _event_target(e).innerHTML = 'pawn promotes to <b>' + P4WN_PROMOTION_STRINGS[x] + '</b>';
      };
    },
    refresh: function(el) {
      el.innerHTML = 'pawn promotes to <b>' + P4WN_PROMOTION_STRINGS[this.pawn_becomes] + '</b>';
    }
  },
  {/*computer level*/
    onclick_wrap: function(p4d) {
      return function(e) {
        var x = (p4d.computer_level + 1) % P4WN_LEVELS.length;
        p4d.computer_level = x;
        _event_target(e).innerHTML = 'computer level: <b>' + P4WN_LEVELS[x] + '</b>';
      };
    },
    refresh: function(el) {
      el.innerHTML = 'computer level: <b>' + P4WN_LEVELS[this.computer_level] + '</b>';
    }
  },
  {/*draw button -- hidden unless a draw is offered */
    id: 'draw_button',
    label: '<b>Draw?</b>',
    onclick_wrap: function(p4d) {
      return function(e) {
        window.clearTimeout(p4d.next_move_timeout);
        window.clearTimeout(p4d.auto_play_timeout);
        p4d.refresh_buttons();
        p4d.log('DRAW');
        p4_log(p4_state2fen(p4d.board_state));
        p4d.auto_play_timeout = undefined;
        p4d.next_move_timeout = undefined;
      };
    },
    move_listener_wrap: function(p4d) {
      return function(move_result) {
        var draw_button = p4d.elements.draw_button;
        if (move_result.flags & P4_MOVE_FLAG_DRAW) {
          draw_button.style.display = 'inline-block';
          if (p4d.draw_offered || p4d.draw_offers > 5) {
            draw_button.style.color = '#c00';
          }
          p4d.draw_offered = true;
          p4d.draw_offers ++;
        } else {
          p4d.draw_offered = false;
          draw_button.style.color = '#000';
          draw_button.style.display = 'none';
        }
      };
    },
    hidden: true
  }
];

_p4d_proto.write_controls_html = function(lut) {
  var div = this.elements.controls;
  var buttons = this.buttons;
  for (var i = 0; i < lut.length; i++) {
    var o = lut[i];
    if (o.debug && ! P4_DEBUG) {
      continue;
    }
    var span = p4d_new_child(div, "span");
    span.className = 'p4wn-control-button';
    buttons.elements.push(span);
    _add_event_listener(span, "click",
    o.onclick_wrap(this));
    if (o.label) {
      span.innerHTML = o.label;
    }
    if (o.move_listener_wrap) {
      this.move_listeners.push(o.move_listener_wrap(this));
    }
    if (o.hidden) {
      span.style.display = 'none';
    }
    if (o.refresh) {
      buttons.refreshers.push([o.refresh, span]);
    }
    if (o.id) {
      this.elements[o.id] = span;
    }
  }
  this.refresh_buttons();
};

function parse_query(query) {
    if (query === undefined) {
      query = window.location.search.substring(1);
    }
    if (! query) {
      return [];
    }
    var args = [];
    var re = /([^&=]+)=?([^&]*)/g;
    while (true) {
        var match = re.exec(query);
        if (match === null) {
          break;
        }
        args.push([decodeURIComponent(match[1].replace(/\+/g, " ")),
                   decodeURIComponent(match[2].replace(/\+/g, " "))]);
    }
    return args;
}

_p4d_proto.interpret_query_string = function() {
    /*XXX Query arguments are not all sanitised.
     */
    var attrs = {
        start: function(s) {p4_fen2state(s, this.board_state)},
        level: function(s) {this.computer_level = parseInt(s)},
        player: function(s) {
            var players = {
                white: ['human', 'computer'],
                black: ['computer', 'human'],
                both: ['human', 'human'],
                neither: ['computer', 'computer']
            }[s.toLowerCase()];
            if (players !== undefined) {
                this.players = players;
                this.maybe_rotate_board();
            }
        },
        debug: function(s) {P4_DEBUG = parseInt(s)}
    };
    var i;
    var query = parse_query();
    for (i = 0; i < query.length; i++) {
        var p = query[i];
        var fn = attrs[p[0]];
        if (fn !== undefined && attrs.hasOwnProperty(p[0])) {
            fn.call(this, p[1]);
            this.refresh_buttons();
        }
    }
};

function P4wn_display(target) {
  if (! this instanceof P4wn_display) {
    return new P4wn_display(target);
  }
  var container;
  if (typeof(target) == 'string') {
    container = document.getElementById(target);
  } else if (target.jquery !== undefined) {
    container = target.get(0);
  } else {
    container = target;
  }
  var inner = p4d_new_child(container, "div", P4WN_WRAPPER_CLASS);
  this.elements = {};
  this.elements.inner = inner;
  this.elements.container = container;
  var board = this.elements.boardCanvas = p4d_new_child(inner, "canvas", P4WN_BOARD_CLASS);
  var log = this.elements.log = p4d_new_child(inner, "div", P4WN_LOG_CLASS);
  this.elements.messages = p4d_new_child(inner, "div", P4WN_MESSAGES_CLASS);
  this.elements.controls = p4d_new_child(container, "div", P4WN_CONTROLS_CLASS);
  this.start = 0;
  this.draw_offers = 0;
  this.board_state = p4_new_game();
  this.players = ['human', 'computer']; //[white, black] controllers
  this.pawn_becomes = 0; //index into P4WN_PROMOTION_* arrays
  this.computer_level = P4WN_DEFAULT_LEVEL;
  this.buttons = {
    elements: [],
    refreshers: []
  };
  this.move_listeners = [];
  return this;
}

_p4d_proto.render_elements = function() {
  var e = this.elements;
  var height = P4WN_BOARD_OFFSET_TOP + (8*P4WN_SQUARE_HEIGHT);
  var width = P4WN_BOARD_OFFSET_LEFT + (8*P4WN_SQUARE_WIDTH);
  var style_height = height + 'px';
  var style_width = width + 'px';
  e.inner.style.height = style_height;
  e.log.style.height = style_height;
  e.boardCanvas.height = height;
  e.boardCanvas.width = width
  e.controls.style.width = style_width;
};

function p4wnify(id) {
  var p4d = new P4wn_display(id);
  p4d.render_elements();
  p4d.write_board_html();
  p4d.write_controls_html(P4WN_CONTROLS);
  p4d.interpret_query_string();
  p4d.refresh();
  return p4d;
}

P4wn_display.prototype = _p4d_proto;

function mouseDownListener(evt, p4d, mouseDownFunction) {
  var canvas = p4d.elements.boardCanvas;
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
    var mouseMoveListenerThis = function(evt) {
      mouseMoveListener(evt, p4d);
    };
    var mouseUpListenerThis = function(evt) {
      mouseUpListener(evt, p4d, mouseUpListenerThis, mouseMoveListenerThis);
    };

    if (canvas.dragging) {
      window.addEventListener("mousemove", mouseMoveListenerThis, false);
    }
    canvas.removeEventListener("mousedown", mouseDownFunction, false);
    window.addEventListener("mouseup", mouseUpListenerThis, false);
    return false;
  }

  function mouseUpListener(evt, p4d, mouseUpFunction, mouseMoveFunction) {
    var canvas = p4d.elements.boardCanvas;
    var mouseDownListenerThis = function(evt) {
      mouseDownListener(evt, p4d, mouseDownListenerThis);
    };
    canvas.addEventListener("mousedown", mouseDownListenerThis, false);
    window.removeEventListener("mouseup", mouseUpFunction, false);
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
        p4d.move(startField.outputID, targetField.outputID, P4WN_PROMOTION_INTS[game.pawn_becomes]);
        p4d.refresh();
        canvas.dragging = false;
        canvas.draggedPiece = null;
        window.removeEventListener("mousemove", mouseMoveFunction, false);
      }
    }

    function mouseMoveListener(evt, p4d) {
      var canvas = p4d.elements.boardCanvas;
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
