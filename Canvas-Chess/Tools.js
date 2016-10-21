var createNewChild = function(element, childtag, className) {
  var child = document.createElement(childtag);
  element.appendChild(child);
  if (className !== undefined) {
    child.className = className;
  }
  return child;
};
