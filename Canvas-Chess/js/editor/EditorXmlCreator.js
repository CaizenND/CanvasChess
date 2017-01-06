function EditorXmlCreator(viewmodel) {
	this.viewmodel = viewmodel;
}

EditorXmlCreator.prototype.create = function() {
    var xmlDoc = this.createExerciseRoot();
	this.createConfig(xmlDoc);
    this.createInput(xmlDoc);
    this.createTask(xmlDoc);
    this.createAnswers(xmlDoc);
    this.createAnswerOptions(xmlDoc);
    this.createFeedback(xmlDoc);
    this.createFeedbackChoices(xmlDoc);
	this.createAdvice(xmlDoc);
	this.createAdviceOptions(xmlDoc);
	this.createSkipmessage(xmlDoc);
	this.createCorrectAnswer(xmlDoc);
	this.createCorrectAnswerChoice(xmlDoc);
	this.createCorrectAnswerMessage(xmlDoc);
	
	var file = new Blob([xmlDoc.documentElement.outerHTML], {type: "text/plain"});
  	window.open(URL.createObjectURL(file));
    console.log(xmlDoc);
}

EditorXmlCreator.prototype.createExerciseRoot = function() {
  var xmlDoc = document.implementation.createDocument(null, "exercise");
  typeAttr = xmlDoc.createAttribute("type");
  typeAttr.nodeValue = "chessMC";

  xmlDoc.getElementsByTagName("exercise")[0].setAttributeNode(typeAttr);

  return xmlDoc;
}
EditorXmlCreator.prototype.createConfig = function(xmlDoc) {
	var configElement = xmlDoc.createElement("config");
	
	var configString = this.addFenNotation();
	configString += this.addReplayFilePath();
	configString += this.addControlElementsConfig();
	configString += this.addSize();
	configString += this.addPlayers();
	configString += this.addInteraction();
	configString += this.addPromotion();
	configString += this.addDifficulty();
	configString += this.addEditor();
	
	var configElementText = xmlDoc.createTextNode(configString);
	configElement.appendChild(configElementText);
	xmlDoc.getElementsByTagName("exercise")[0].appendChild(configElement);
}

EditorXmlCreator.prototype.addFenNotation = function() {
	if(this.viewmodel.startFEN() != "") {
		return "startFEN:" + this.viewmodel.startFEN() + ";";
	} 
	return "";
}

EditorXmlCreator.prototype.addReplayFilePath = function() {
	if(this.viewmodel.replay() != "") {
		return "replay:" + this.viewmodel.replay() + ";";
	} 
	return "";
}

EditorXmlCreator.prototype.addControlElementsConfig = function() {
	if(this.viewmodel.selectedConfig() != "") {
		return "config:" + this.viewmodel.selectedConfig() + ";";
	} 
	return "";
}

EditorXmlCreator.prototype.addSize = function() {
	if(this.viewmodel.size() != "") {
		return "size:" + this.viewmodel.size() + ";";
	} 
	return "";
}

EditorXmlCreator.prototype.addPlayers = function() {
	if(this.viewmodel.playerOne() == "" || this.viewmodel.playerTwo() == "")
		return "";
	return "players:" + this.viewmodel.playerOne() + "," + this.viewmodel.playerTwo() + ";";
}

EditorXmlCreator.prototype.addInteraction = function() {
	if(this.viewmodel.selectedInteraction() != "") {
		return "interaction:" + this.viewmodel.selectedInteraction() + ";";
	} 
	return "";
}

EditorXmlCreator.prototype.addPromotion = function() {
	if(this.viewmodel.selectedPromotion() != "") {
		return "promotion:" + this.viewmodel.selectedPromotion() + ";";
	} 
	return "";
}

EditorXmlCreator.prototype.addDifficulty = function() {
	if(this.viewmodel.selectedDifficulty() != "") {
		return "difficulty:" + this.viewmodel.selectedDifficulty() + ";";
	} 
	return "";
}

EditorXmlCreator.prototype.addEditor = function() {
	if(this.viewmodel.editor()) {
		return "editor;";
	} 
	return "";
}

EditorXmlCreator.prototype.createInput = function(xmlDoc) {
  var inputElement = xmlDoc.createElement("input");
  xmlDoc.getElementsByTagName("exercise")[0].appendChild(inputElement);
}

EditorXmlCreator.prototype.createTask = function(xmlDoc) {
  var taskElement = xmlDoc.createElement("task");
  taskElementText = xmlDoc.createTextNode(this.viewmodel.task());
  taskElement.appendChild(taskElementText);
  xmlDoc.getElementsByTagName("exercise")[0].appendChild(taskElement);
}

EditorXmlCreator.prototype.createAnswers = function(xmlDoc) {
  var answersElement = xmlDoc.createElement("answers");
  xmlDoc.getElementsByTagName("exercise")[0].appendChild(answersElement);

  var randomize = document.getElementById("randomize").checked;
  var randomizeAttr  =  xmlDoc.createAttribute("randomize");
  randomizeAttr.nodeValue = randomize;
  xmlDoc.getElementsByTagName("answers")[0].setAttributeNode(randomizeAttr);
}

EditorXmlCreator.prototype.createAnswerOptions = function(xmlDoc) {
	for(var i=0;i<this.viewmodel.answers().length;i++) {
      var optionElement = xmlDoc.createElement("option");
      var optionElementText = xmlDoc.createTextNode(this.viewmodel.answers()[i].answer);
      optionElement.appendChild(optionElementText);
      xmlDoc.getElementsByTagName("answers")[0].appendChild(optionElement);
    }
}

EditorXmlCreator.prototype.createFeedback = function(xmlDoc) {
  var feedbackElement = xmlDoc.createElement("feedback");
  xmlDoc.getElementsByTagName("exercise")[0].appendChild(feedbackElement);
}

EditorXmlCreator.prototype.createFeedbackChoices = function(xmlDoc) {
    for (var i = 0; i < this.viewmodel.feedbacks().length; i++) {
      var choiceElement = xmlDoc.createElement("choice");
	  var currentFeedback = this.viewmodel.feedbacks()[i]
      var choiceElementText = xmlDoc.createTextNode(currentFeedback.feedback);
      choiceElement.appendChild(choiceElementText);
      xmlDoc.getElementsByTagName("feedback")[0].appendChild(choiceElement);

      var patternAttr  =  xmlDoc.createAttribute("pattern");
	  var pattern = "";
		for(var j=0;j<this.viewmodel.answers().length;j++) {
			pattern += document.getElementById("answer-option" + j + i).value;
		}
	  patternAttr.nodeValue = pattern;
      choiceElement.setAttributeNode(patternAttr);
    }
}
EditorXmlCreator.prototype.createAdvice = function(xmlDoc) {
	var adviceElement = xmlDoc.createElement("advice");
	xmlDoc.getElementsByTagName("exercise")[0].appendChild(adviceElement);
}

EditorXmlCreator.prototype.createAdviceOptions = function(xmlDoc) {
	for(var i=0;i<this.viewmodel.advices().length;i++) {
      var optionElement = xmlDoc.createElement("option");
      var optionElementText = xmlDoc.createTextNode(this.viewmodel.advices()[i].advice);
      optionElement.appendChild(optionElementText);
      xmlDoc.getElementsByTagName("advice")[0].appendChild(optionElement);
    }
}

EditorXmlCreator.prototype.createSkipmessage = function(xmlDoc) {
	var skipMsgElement = xmlDoc.createElement("skipmessage");
	skipMsgElementText = xmlDoc.createTextNode(this.viewmodel.skipMsg());
	skipMsgElement.appendChild(skipMsgElementText);
	xmlDoc.getElementsByTagName("exercise")[0].appendChild(skipMsgElement);
}

EditorXmlCreator.prototype.createCorrectAnswer = function(xmlDoc) {
	var correctAnswerElement = xmlDoc.createElement("correctanswer");
	xmlDoc.getElementsByTagName("exercise")[0].appendChild(correctAnswerElement);
}

EditorXmlCreator.prototype.createCorrectAnswerChoice = function(xmlDoc) {
	var pattern = "";
	for(var i=0;i<this.viewmodel.answers().length;i++) {
		this.viewmodel.answers()[i].correct() ? pattern += "1" : pattern += "0";
	}
	
	patternAttr = xmlDoc.createAttribute("pattern");
	patternAttr.nodeValue = pattern;
	var choiceElement = xmlDoc.createElement("choice");
	xmlDoc.getElementsByTagName("correctanswer")[0].appendChild(choiceElement);
	choiceElement.setAttributeNode(patternAttr);
}

EditorXmlCreator.prototype.createCorrectAnswerMessage = function(xmlDoc) {
	var correctAnswerMsgElement = xmlDoc.createElement("message");
	correctAnswerMsgElementText = xmlDoc.createTextNode(this.viewmodel.correctAnswerMsg());
	correctAnswerMsgElement.appendChild(correctAnswerMsgElementText);
	xmlDoc.getElementsByTagName("correctanswer")[0].appendChild(correctAnswerMsgElement);
}