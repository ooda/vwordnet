/* Author: Hugues Demers
 * Copyrights 2013
 */
define(["knockout"],
function (ko) {
  var exports = {
    word: ko.observable('funny'),
    definitions: ko.observableArray()
  };
  return exports;
});
