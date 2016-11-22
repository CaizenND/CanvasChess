var ConfigurationManager = {
  configList : []
}

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
}

ConfigurationManager.getConfiguration = function(name) {
  for (var i = 0; i < this.configList.length; i++) {
    if (this.configList[i].name == name) {
      return this.configList[i];
    }
  }
  return null;
}
