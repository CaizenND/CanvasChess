
/**
 * Creates a container for a control area and a meta erea for that container.
 * The meta area contains a given title and allows to toggle the visibility of
 * the container.
 * @param parentElement   HTML node element that should contain the new nodes
 * @param title           Title that should be display in the meta area
 * @return DIV element of the container
 */
var createMetaAndContainer = function(parentElement, title) {
  var categoryMeta = createNewChild(parentElement, "div", "category-meta");

  var container = createNewChild(parentElement, "div", "category-container");
  container.style.display = "block";
  container.meta = categoryMeta;

  var buttonCollapse = createNewChild(categoryMeta, "button", "button-chess button-float button-sign");
  buttonCollapse.appendChild(document.createTextNode("-"));

  buttonCollapse.onclick = (function(element) {
    return function() {
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }
      if(element.style.display == "block") {
        element.style.display = "none";
        this.appendChild(document.createTextNode("+"));
      } else {
        element.style.display = "block";
        this.appendChild(document.createTextNode("-"));
      }
    }
  })(container);

  var metaDescription = createNewChild(categoryMeta, "div", "control-text");
  metaDescription.appendChild(document.createTextNode(title));

  return container;
};

/**
 * Creates the game controls for the frontend.
 * Uses the defined configurations.
 * @param parentElement     HTML node element that should contain the new nodes
 * @param frontEnd          Frontend object that should accessed by the controls
 * @param engineInterface   Engine interface object that should accessed by the controls
 * @param config            The configuration object for the frontend
 * @return DIV element containing the controls
 */
var createGameControls = function(parentElement, frontEnd, engineInterface, config) {

  // Container & meta-container (collapse)
  var gameControls = createMetaAndContainer(parentElement, "Game controls");

  // Interaction Mode
  if (config.showInteractionMode) {
    var container = createNewChild(gameControls, "div", "control-container");

    var interactionDescription = createNewChild(container, "div", "control-description");
    interactionDescription.appendChild(document.createTextNode("Interaction style"));

    var interactionSelect = createNewChild(container, "div", "radio-group");

    var buttonTexts = ["Drag & Drop", "Select & Move"];
    for (var i = 0; i < buttonTexts.length; i++) {

      var input = createNewChild(interactionSelect, "input", "group-input");
      input.type = "radio";
      input.name = "interaction-options";
      input.value = i+1;
      input.onchange = (function(frontEnd, element) {
        return function() {
          var mode = this.value;
          frontEnd.setInteractionMode(mode);
        }.bind(element)
      })(frontEnd, input);
      input.id = "interaction-options-" + i;
      if (input.value == config.defaultInteractionMode) {
        input.checked = true;
      }

      var label = createNewChild(interactionSelect, "label", "radio-option  option-interaction");
      label.htmlFor = input.id;
      label.appendChild(document.createTextNode(buttonTexts[i]));
    }
  }

  // Pawn promotion
  if (config.showPawnPromotion) {
    container = createNewChild(gameControls, "div", "control-container");

    var promotionDescription = createNewChild(container, "div", "control-description");
    promotionDescription.appendChild(document.createTextNode("Pawn promotion"));

    var promotionSelect = createNewChild(container, "div", "radio-group");

    buttonTexts = ["Queen", "Rook", "Knight", "Bishop"];
    for (var i = 0; i < buttonTexts.length; i++) {

      var input = createNewChild(promotionSelect, "input", "group-input");
      input.type = "radio";
      input.name = "promotion-options";
      input.value = buttonTexts[i].toLowerCase();
      input.onchange = (function(engine, element) {
        return function() {
          var promotion = this.value;
          engine.setPawnPromotion(promotion);
        }.bind(element)
      })(engineInterface, input);
      input.id = "promotion-options" + i;
      if (input.value == config.defaultPawnPromotion) {
        input.checked = true;
      }

      var label = createNewChild(promotionSelect, "label", "radio-option option-promotion");
      label.htmlFor = input.id;
      label.appendChild(document.createTextNode(buttonTexts[i]));
    }
  }

  // AI select
  if (config.showAISelect) {
    // Control white
    container = createNewChild(gameControls, "div", "control-container");

    var whiteDescription = createNewChild(container, "div", "control-description");
    whiteDescription.appendChild(document.createTextNode("White"));

    var whiteSelect = createNewChild(container, "div", "radio-group");

    buttonTexts = ["Human", "Computer"];
    for (var i = 0; i < buttonTexts.length; i++) {

      var input = createNewChild(whiteSelect, "input", "group-input");
      input.type = "radio";
      input.name = "control-white-options";
      input.value = buttonTexts[i].toLowerCase();
      input.onchange = (function(frontEnd, element) {
        return function() {
          frontEnd.setColorControl("white", this.value);
        }.bind(element)
      })(frontEnd, input);
      input.id = "control-options" + i;
      if (input.value == config.defaultAI[0]) {
        input.checked = true;
      }

      var label = createNewChild(whiteSelect, "label", "radio-option option-control");
      label.htmlFor = input.id;

      var image = createNewChild(label, "img", "option-image");
      image.src = "../img/" + buttonTexts[i].toLowerCase() + ".png";

      var text = createNewChild(label, "div", "option-text");
      text.appendChild(document.createTextNode(buttonTexts[i]));
    }

    // Control black
    container = createNewChild(gameControls, "div", "control-container");

    var blackDescription = createNewChild(container, "div", "control-description");
    blackDescription.appendChild(document.createTextNode("Black"));

    var blackSelect = createNewChild(container, "div", "radio-group");

    buttonTexts = ["Human", "Computer"];
    for (var i = 0; i < buttonTexts.length; i++) {

      var input = createNewChild(blackSelect, "input", "group-input");
      input.type = "radio";
      input.name = "control-options";
      input.value = buttonTexts[i].toLowerCase();
      input.onchange = (function(frontEnd, element) {
        return function() {
          frontEnd.setColorControl("black", this.value);
        }.bind(element)
      })(frontEnd, input);
      input.id = "control-black-options" + i;
      if (input.value == config.defaultAI[1]) {
        input.checked = true;
      }

      var label = createNewChild(blackSelect, "label", "radio-option option-control");
      label.htmlFor = input.id;

      var image = createNewChild(label, "img", "option-image");
      image.src = "../img/" + buttonTexts[i].toLowerCase() + ".png";

      var text = createNewChild(label, "div", "option-text");
      text.appendChild(document.createTextNode(buttonTexts[i]));
    }
  }

  // Computer difficulty
  if (config.showDifficulty) {
    container = createNewChild(gameControls, "div", "control-container");

    var difficultyDescription = createNewChild(container, "div", "control-description");
    difficultyDescription.appendChild(document.createTextNode("AI difficulty"));

    var buttonDecrease = createNewChild(container, "button", "button-chess button-float button-sign");
    buttonDecrease.appendChild(document.createTextNode("-"));

    var difficultyLabel = createNewChild(container, "div", "control-text");
    difficultyLabel.appendChild(document.createTextNode(engineInterface.getComputerLevel()));

    var buttonIncrease = createNewChild(container, "button", "button-chess button-float button-sign");
    buttonIncrease.appendChild(document.createTextNode("+"));

    buttonDecrease.onclick = (function(engine, label) {
      return function() {
        var computerLevel = engine.getComputerLevel();
        computerLevel = engine.setComputerLevel(computerLevel-1);
        while (difficultyLabel.firstChild) {
          difficultyLabel.removeChild(difficultyLabel.firstChild);
        }
        difficultyLabel.appendChild(document.createTextNode(computerLevel));
      }
    })(engineInterface, difficultyLabel);

    buttonIncrease.onclick = (function(engine, label) {
      return function() {
        var computerLevel = engine.getComputerLevel();
        computerLevel = engine.setComputerLevel(computerLevel+1);
        while (difficultyLabel.firstChild) {
          difficultyLabel.removeChild(difficultyLabel.firstChild);
        }
        difficultyLabel.appendChild(document.createTextNode(computerLevel));
      }
    })(engineInterface, difficultyLabel);
  }

  // Reset game
  if (config.showReset) {
    container = createNewChild(gameControls, "div", "control-container container-center");

    var resetButton = createNewChild(container, "button", "button-chess item-center");
    resetButton.appendChild(document.createTextNode("Reset"));
    resetButton.onclick = (function(frontEnd) {
      return function() {
        var moveID = this.value;
        frontEnd.goToMove(0);
      }
    })(frontEnd);
  }

  // Export game
  if (config.showExport) {
    container = createNewChild(gameControls, "div", "control-container container-center");

    var exportButton = createNewChild(container, "button", "button-chess item-center");
    exportButton.appendChild(document.createTextNode("Export game as XML"));
    exportButton.onclick = frontEnd.exportGameToXML;
  }

  if (!gameControls.hasChildNodes()) {
    parentElement.removeChild(gameControls.meta);
    parentElement.removeChild(gameControls);
  }

  return gameControls;
};

 /**
  * Creates the logging controls for the frontend.
  * Uses the defined configurations.
  * @param parentElement     HTML node element that should contain the new nodes
  * @param frontEnd          Frontend object that should accessed by the controls
  * @param config            The configuration object for the frontend
  * @return DIV element containing the controls
  */
var createLoggingControls = function(parentElement, frontEnd, config) {

  // Container & meta-container (collapse)
  if (config.showLogging) {
    var loggingControls = createMetaAndContainer(parentElement, "Log");
    loggingControls.meta.className += " flex-solid"
    loggingControls.className += " scrollable flex-grow";
    return loggingControls;
  }
  return null;
};

 /**
  * Creates the replay controls for the frontend.
  * @param parentElement     HTML node element that should contain the new nodes
  * @param frontEnd          Frontend object that should accessed by the controls
  * @return DIV element containing the controls
  */
var createReplayControls = function(parentElement, frontEnd) {

  // Container & meta-container (collapse)
  var replayControls = createMetaAndContainer(parentElement, "Replay controls");

  var container = createNewChild(replayControls, "div", "control-container container-center");

  var progressBar = createNewChild(container, "progress", "progress-replay item-center");
  progressBar.value = "0";
  progressBar.max = "1";

  var container = createNewChild(replayControls, "div", "control-container container-center");

  var replayButton = createNewChild(container, "button", "button-replay button-chess item-center");
  replayButton.appendChild(document.createTextNode("Replay"));
  replayButton.onclick = (function(frontEnd) {
    return function() {
      frontEnd.playReplay();
    }
  })(frontEnd);

  return replayControls;
};

 /**
  * Creates the editor controls for the frontend.
  * @param parentElement    HTML node element that should contain the new nodes
  * @param boardEditor      Board editor object that should accessed by the controls
  * @return DIV element containing the controls
  */
function createEditorControls(parentElement, boardEditor) {

  // Container & meta-container (collapse)
  var editorControls = createMetaAndContainer(parentElement, "Editor controls");

  // active player
  var container = createNewChild(editorControls, "div", "control-container");

  var activePlayernDescription = createNewChild(container, "div", "control-description");
  activePlayernDescription.appendChild(document.createTextNode("Active player"));

  editorControls.activePlayer = createNewChild(container, "select", "selection");

  var playerWhite = createNewChild(editorControls.activePlayer, "option");
  playerWhite.value = "w";
  playerWhite.appendChild(document.createTextNode("white"));

  var playerBlack = createNewChild(editorControls.activePlayer, "option");
  playerBlack.value = "b";
  playerBlack.appendChild(document.createTextNode("black"));

  // white castling
  container = createNewChild(editorControls, "div", "control-container");

  var whiteCastlingDescription = createNewChild(container, "div", "control-description");
  whiteCastlingDescription.appendChild(document.createTextNode("White Castling"));

  editorControls.whiteCastling = createNewChild(container, "select", "selection");

  editorControls.whiteCastling.none = createNewChild(editorControls.whiteCastling, "option");
  editorControls.whiteCastling.none.value = "";
  editorControls.whiteCastling.none.appendChild(document.createTextNode(""));

  editorControls.whiteCastling.kingQueen = null;
  editorControls.whiteCastling.king = null;
  editorControls.whiteCastling.queen = null;

  // black castling
  container = createNewChild(editorControls, "div", "control-container");

  var blackCastlingDescription = createNewChild(container, "div", "control-description");
  blackCastlingDescription.appendChild(document.createTextNode("Black Castling"));


  editorControls.blackCastling = createNewChild(container, "select", "selection");

  editorControls.blackCastling.none = createNewChild(editorControls.blackCastling, "option");
  editorControls.blackCastling.none.value = "";
  editorControls.blackCastling.none.appendChild(document.createTextNode(""));

  editorControls.blackCastling.kingQueen = null;
  editorControls.blackCastling.king = null;
  editorControls.blackCastling.queen = null;

  // continue button
  container = createNewChild(editorControls, "div", "control-container container-center");

  var continueButton = createNewChild(container, "button", "button-chess item-center");
  continueButton.appendChild(document.createTextNode("Continue with current board"));
  continueButton.onclick = boardEditor.exportFEN.bind(boardEditor);

  return editorControls;
};
