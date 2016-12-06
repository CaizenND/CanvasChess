
/**
 * Creates a child element of a given type and with given classes for a given
 * parent element:
 * @param element     Parent element
 * @param childtag    Type of the child element
 * @param className   Class(es) of the child element
 * @return Child element
 */
var createNewChild = function(element, childtag, className) {
  var child = document.createElement(childtag);
  element.appendChild(child);
  if (className !== undefined) {
    child.className = className;
  }
  return child;
};

/**
 * Parses an XML document into an XML DOM object and returns it
 * @param filename   the name of the XML document, that should be parsed
 * @return the created XML DOM object
 */
function loadXMLDoc(filename) {

	// Create an XMLHttpRequest Object to parse the XML document (filename) into an XML DOM object
	if (window.XMLHttpRequest) {

		xhttp = new XMLHttpRequest();

	// IE5 and IE6
	} else {

    xhttp = new ActiveXObject("Microsoft.XMLHTTP");

		alert("Achtung, \n " +
				"Ihr Browser ist anscheinend veraltet und unterstützt einige benötigte Funktionen nicht. \n" +
				"Bitte aktualisieren Sie auf eine neuere Version.");
	}

	xhttp.open("GET",filename,false);
	xhttp.send();
	return xhttp.responseXML;
};

/**
 * Parses an xml file containing a chess game replay.
 * @param filename    Path to the xml file that should be parsed
 * @return replay object {startFEN, movelist}
 */
var parseXMLFile = function(filename) {
  var xmlDoc = loadXMLDoc(filename);
  var startFEN = null;
  var movelist = [];

  if (xmlDoc != null) {
    if (xmlDoc.getElementsByTagName("ChessGame").length > 0) {
      var chessGameNode = xmlDoc.getElementsByTagName("ChessGame")[0];
      if (chessGameNode.getElementsByTagName("StartingPosition").length > 0) {
        var startingPositionNode = chessGameNode.getElementsByTagName("StartingPosition")[0];
        if (startingPositionNode.childNodes.length > 0) {
          if (startingPositionNode.childNodes[0].nodeType == Node.TEXT_NODE) {
            startFEN = startingPositionNode.childNodes[0].nodeValue;
            var idCounter = 1;
            var moveError = false;
            var moveNodes = chessGameNode.getElementsByTagName("Move");
            for (var i = 0; i < moveNodes.length; i++) {
              var currentMoveNode = moveNodes[i];
              var move = parseMoveNode(currentMoveNode, idCounter, filename);
              if (move != null) {
                movelist.push(move);
              } else {
                moveError = true;
              }
              idCounter++;
            }
            if (moveError) {
              movelist = [];
            }
          } else {
            console.error("\"StartingPosition\"-element in file \"" + filename + "\" does not have the right format.");
          }
        } else {
          console.error("\"StartingPosition\"-element in file \"" + filename + "\" is empty.");
        }
      } else {
        console.error("No \"StartingPosition\"-tag in file \"" + filename + "\" found.");
      }
    } else {
      console.error("No \"ChessGame\"-tag in file \"" + filename + "\" found.");
    }
  } else {
    console.error("Invalid xml file \"" + filename + "\".");
  }

  var replay = {
    startFEN: startFEN,
    movelist: movelist
  }
  return replay;
};

/**
 * Parses an xml node representing a single move.
 * @param moveNode
 * @param expectedID
 * @param filename
 * @return Move object {start-field, target-field, promotion}
 */
var parseMoveNode = function(moveNode, expectedID, filename) {
  var moveError = false;
  var startField = "";
  var targetField = "";
  var promotion = "";

  if (moveNode.attributes.getNamedItem("id") != null) {
    var id = moveNode.attributes.getNamedItem("id").nodeValue;
    if (id != expectedID) {
      console.error("\"Move\"-element " + expectedID + " in file \"" + filename + "\" does not have the right ID (is " + id + ").");
      moveError = true;
    }
  } else {
    console.error("\"Move\"-element " + expectedID + " in file \"" + filename + "\" does not have an ID attribute.");
    moveError = true;
  }

  if (moveNode.getElementsByTagName("Start").length > 0) {
    var startNode = moveNode.getElementsByTagName("Start")[0];
    if (startNode.childNodes.length > 0) {
      if (startNode.childNodes[0].nodeType == Node.TEXT_NODE) {
        startField = startNode.childNodes[0].nodeValue;
      } else {
        console.error("\"Start\"-element " + expectedID + " in file \"" + filename + "\" does not have the right format.");
        moveError = true;
      }
    } else {
      console.error("\"Start\"-element " + expectedID + " in file \"" + filename + "\" is empty.");
      moveError = true;
    }
  } else {
    console.error("\"Move\"-element " + expectedID + " in file \"" + filename + "\" is does not contain a \"Start\"-element .");
    moveError = true;
  }

  if (moveNode.getElementsByTagName("Target").length > 0) {
    var targetNode = moveNode.getElementsByTagName("Target")[0];
    if (targetNode.childNodes.length > 0) {
      if (targetNode.childNodes[0].nodeType == Node.TEXT_NODE) {
        targetField = targetNode.childNodes[0].nodeValue;
      } else {
        console.error("\"Target\"-element " + expectedID + " in file \"" + filename + "\" does not have the right format.");
        moveError = true;
      }
    } else {
      console.error("\"Target\"-element " + expectedID + " in file \"" + filename + "\" is empty.");
      moveError = true;
    }
  } else {
    console.error("\"Move\"-element " + expectedID + " in file \"" + filename + "\" is does not contain a \"Target\"-element .");
    moveError = true;
  }

  if (moveNode.getElementsByTagName("Promotion").length > 0) {
    var promotionNode = moveNode.getElementsByTagName("Promotion")[0];
    if (promotionNode.childNodes.length > 0) {
      if (promotionNode.childNodes[0].nodeType == Node.TEXT_NODE) {
        promotion = promotionNode.childNodes[0].nodeValue;
      } else {
        console.error("\"Promotion\"-element " + expectedID + " in file \"" + filename + "\" does not have the right format.");
        moveError = true;
      }
    } else {
      console.error("\"Promotion\"-element " + expectedID + " in file \"" + filename + "\" is empty.");
      moveError = true;
    }
  } else {
    console.error("\"Move\"-element " + expectedID + " in file \"" + filename + "\" is does not contain a \"Promotion\"-element .");
    moveError = true;
  }

  var move = {};
  if (moveError) {
    move = null;
  } else {
    move = {
      start: startField,
      target: targetField,
      promotion: promotion
    };
  }
  return move;
};
