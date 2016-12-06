
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
