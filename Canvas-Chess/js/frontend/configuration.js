
/**
 * Constructor
 * Creates a default configuration object.
 * Note: Configuration has to be given a name and be added to the
 * "ConfigurationManager"
 */
var Configuration = function() {
  this.name = undefined;
  this.size = 55; // >55
  this.showInteractionMode = true;
  this.defaultInteractionMode = 2; // 0, 1, 2
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
  this.showFeedback = true;
  this.showEditor = false;
};

/**
 * Default configuration
 */
var defaultConfiguration = new Configuration();
defaultConfiguration.name = "default";
ConfigurationManager.addConfiguration(defaultConfiguration);

/**
 * Minimal configuration
 * No AI selection
 * No difficulty selection
 * No game export possible
 * No logging of moves
 */
var minimalConfiguration = new Configuration();
minimalConfiguration.name = "minimal";
minimalConfiguration.showAISelect = false;
minimalConfiguration.showDifficulty = false;
minimalConfiguration.showExport = false;
minimalConfiguration.showLogging = false;
ConfigurationManager.addConfiguration(minimalConfiguration);

/**
 * editor configuration
 * Editor enabled
 */
var EditorConfiguration = new Configuration();
EditorConfiguration.name = "editor";
EditorConfiguration.showEditor = true;
ConfigurationManager.addConfiguration(EditorConfiguration);

/*-----------------------Jack specififc configurations-----------------------*/

var JackMCConfiguration = new Configuration();
JackMCConfiguration.name = "jackMC";
JackMCConfiguration.showAISelect = false;
JackMCConfiguration.showDifficulty = false;
JackMCConfiguration.showExport = false;
JackMCConfiguration.showFeedback = false;
ConfigurationManager.addConfiguration(JackMCConfiguration);

var JackQuizConfiguration = new Configuration();
JackQuizConfiguration.name = "jackQuiz";
JackQuizConfiguration.showAISelect = false;
JackQuizConfiguration.showDifficulty = false;
JackQuizConfiguration.showExport = false;
JackQuizConfiguration.showFeedback = false;
ConfigurationManager.addConfiguration(JackQuizConfiguration);

var JackGameConfiguration = new Configuration();
JackGameConfiguration.name = "jackGame";
JackGameConfiguration.showAISelect = false;
JackGameConfiguration.defaultAI = ["human", "computer"]; //[white, black] - human, computer
JackGameConfiguration.showDifficulty = false;
JackGameConfiguration.showExport = false;
ConfigurationManager.addConfiguration(JackGameConfiguration);

var JackSolutionConfiguration = new Configuration();
JackSolutionConfiguration.name = "jackSolution";
JackSolutionConfiguration.showInteractionMode = false;
JackSolutionConfiguration.defaultInteractionMode = 0; // 0, 1, 2
JackSolutionConfiguration.showPawnPromotion = false;
JackSolutionConfiguration.showAISelect = false;
JackSolutionConfiguration.showDifficulty = false;
JackSolutionConfiguration.showReset = false;
JackSolutionConfiguration.showExport = false;
JackSolutionConfiguration.showLogging = false;
JackSolutionConfiguration.allowLoggingInteraction = false;
JackSolutionConfiguration.showFeedback = false;
ConfigurationManager.addConfiguration(JackSolutionConfiguration);
