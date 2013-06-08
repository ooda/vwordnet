/* Author: Hugues Demers
 * Copyrights 2013
  
*/
define([
  "jquery",
  "underscore",
  "knockout",
  "d3",
  "viewmodel",
  "tree"
],
function ($, _, ko, d3, viewmodel, tree) {
  var exports = {}, define, addGraph;

  exports.initialize = function () {
    console.log("Initializing app.");
    ko.applyBindings(viewmodel);
  };

  viewmodel.define = function (word) {
    define(viewmodel.word());
  };

  $(window).resize(function () {

  });

  define = function  (word) {
    // Erase previous entries
    viewmodel.definitions([]);

    return $.ajax({
      url: "define/" + word,
      type: "GET",
      dataType: "json"
    }).done(function  (data) {
      // Add nodes to the DOM through Knockout
      ko.utils.arrayPushAll(viewmodel.definitions, data.definitions);
      // Go through the added nodes and build graphs.
      $(".js-definition").each(function (index, element) {
        addGraph(element, data.definitions[index]);
      });
    });
  };

  addGraph = function (element, definition) {
    var graphContainer;

    graphContainer = d3.select(element)
      .append("div")
      .attr("class", "js-graph");

    tree.build({container: graphContainer})
      .draw(definition.graph);
  };


  return exports;
});
