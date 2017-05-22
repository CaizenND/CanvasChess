/**
 * Contral configuration manager object.
 * No instantiation necessary.
 * @param evt   Mouse event that triggered the listener
 * @return false
 */
var ConfigurationManager = {
  configList : []
};

/**
 * Adds a configuration object to the list.
 * Configuration has to have a name assigned.
 * @param config   Configuration object that should be added
 */
ConfigurationManager.addConfiguration = function(config) {
  // prevent adding of configurations that do not have a name
  // and therefore could not be found
  if (config.name != undefined && config.name != null) {
    var newConfig = true;
    for (var i = 0; i < this.configList.length; i++) {
      if (this.configList[i].name == config.name) {
        this.configList[i] = config;
        newConfig = false;
        break;
      }
    }
    if (newConfig) {
      this.configList.push(config);
    }
  }
};

/**
 * Tries to find a configuration object for a given name.
 * @param name    name of the configuration object that should be found
 * @return Configuration object or null if no object with the given name was found
 */
ConfigurationManager.getConfiguration = function(name) {
  for (var i = 0; i < this.configList.length; i++) {
    if (this.configList[i].name == name) {
      return this.configList[i];
    }
  }
  return null;
};
