var Configuration = function() {
  this.name = "default";
  this.showInteractionMode = true;
  this.defaultInteractionMode = 2; // 1, 2
  this.showPawnPromotion = true;
  this.defaultPawnPromotion = "queen"; // queen, rook, knight, bishop
  this.showAISelect = true;
  this.defaultAI = ["human", "human"]; //[white, black] - human, computer
  this.showDifficulty = true;
  this.defaultDifficulty = 2;
  this.showReset = true;
  this.showExport = true;
  this.showLogging = true;
  this.allowLoggingInteraction = true;
}

var defaultConfiguration = new Configuration();
ConfigurationManager.addConfiguration(defaultConfiguration);

var minimalConfiguration = new Configuration();
minimalConfiguration.name = "minimal";
minimalConfiguration.showAISelect = false;
minimalConfiguration.showDifficulty = false;
minimalConfiguration.showExport = false;
minimalConfiguration.showLogging = false;
ConfigurationManager.addConfiguration(minimalConfiguration);

var testConfigA = new Configuration();
testConfigA.name = "testA";
testConfigA.defaultInteractionMode = 1; // 1, 2
testConfigA.defaultPawnPromotion = "rook"; // queen, rook, knight, bishop
testConfigA.defaultAI = ["human", "computer"]; //[white, black] - human, computer
testConfigA.defaultDifficulty = 3;
testConfigA.allowLoggingInteraction = false;
ConfigurationManager.addConfiguration(testConfigA);

var testConfigB = new Configuration();
testConfigB.name = "testB";
testConfigB.showAISelect = false
testConfigB.defaultAI = ["computer", "computer"]; //[white, black] - human, computer
ConfigurationManager.addConfiguration(testConfigB);
