/* Author: Hugues Demers
 * Copyrights 2013
  
*/
define([
  "jquery",
  "underscore",
  "knockout",
  "d3",
  "viewmodel",
  "tree",
  "infomsg",
  "bootstrap",
  "kinetic"
],
function ($, _, ko, d3, viewmodel, tree, infomsg) {
  var exports = {}, define, addGraph;

  exports.initialize = function () {
    console.log("Initializing app.");
    ko.applyBindings(viewmodel);
    $("body").kinetic({cursor: 'default', slowdown: 0.7});
  };

  viewmodel.define = function (word) {
    define(viewmodel.word());
  };

  define = function  (word) {
    // Erase previous entries
    viewmodel.definitions([]);

    if (word === "") {
      return;
    }

    infomsg.clear();
    $("#spinner").removeClass("hidden");

    return $.ajax({
      url: "define/" + word,
      type: "GET",
      dataType: "json"
    }).done(function  (data) {
      if (data.definitions.length === 0) {
        infomsg.info("No definition found", "Sorry, we couldn't produce" +
        " a definition for this word. <br>Try again.");
      }
      else {
        // Because Bootstrap selects element with jQuery and selectors must
        // escape dots, we need to remove those dots from the ids.
        data.definitions.forEach(function (def) {
          def.name = def.rootsynset.replace(/\./g, "");
        });

        // Add nodes to the DOM through Knockout
        ko.utils.arrayPushAll(viewmodel.definitions, data.definitions);
        // Go through the added nodes and build graphs.
        $(".js-definition").each(function (index, element) {
          addGraph(element, data.definitions[index]);
        });
        $('.nav a:first').tab('show');
      }
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.log("Failed", jqXHR, textStatus, errorThrown);
      var data = JSON.parse(jqXHR.responseText),
        message = "We're sorry, but an error has occured." +
            " Our team has been contacted and we are working to solve " +
            "this issue. (" + data.message + ")";
      infomsg.error(textStatus, message, 0);
    }).always(function () {
      $("#spinner").addClass("hidden");
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
