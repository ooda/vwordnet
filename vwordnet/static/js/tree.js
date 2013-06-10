/* Author: Hugues Demers
 * Copyrights 2013
  
*/
define([
  "jquery",
  "underscore",
  "viewmodel",
  "d3",
  "knockout"
],
function  ($, _, viewmodel, d3, ko) {
  var exports = {},
    closeAll, toggle, makeTree;

  exports.build = function (options) {
    var that = {},
      defaults = {
        container: null
      },
      root, tree, diagonal, vis, index,
      showAll, update,
      opts = _.defaults(options, defaults);

    that.draw = function  (rootNode) {
      var width, height,
        m = [20, 20, 20, 120],
        nodeWidth = 180, nodeHeight = 15;

      index = 0;

      root = rootNode;
      tree = d3.layout.tree().size(null).elementsize([nodeHeight, nodeWidth]);

      var nodes = tree.nodes(root);
      var max_x = d3.max(nodes, function (d) {return d.x; });
      var max_y = d3.max(nodes, function (d) {return d.depth * nodeWidth; });

      height = max_x + 20;
      width = max_y + 100;

      diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.y, d.x]; });

      vis = opts.container.append("svg:svg")
        .attr("width", width + m[1] + m[3])
        .attr("height", height + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

      root.x0 = height / 2;
      root.y0 = 0;

      update(root);
        // Initialize the display to show a few nodes.
      //root.children.forEach(closeAll);
      //toggle(root);
      //showAll(root);
    };

    update = function  (source) {
      var duration = d3.event && d3.event.altKey ? 5000 : 500;

        // Compute the new tree layout.
      var nodes = tree.nodes(root).reverse();

        // Normalize for fixed-depth.
      nodes.forEach(function (d) { d.y = d.depth * 180; });

        // Update the nodes…
      var node = vis.selectAll("g.js-node")
        .data(nodes, function (d) { return d.id || (d.id = ++index); });

        // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("svg:g")
        .attr("class", function (d) {
          return "js-node " + (d.path ? "js-path": '');
        })
        .attr("transform", function (d) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", function (d) { toggle(d); update(d); });

      nodeEnter.append("svg:circle")
        .attr("r", 1e-6)
        .attr("class", function (d) { return d._children ? "js-parent" : ''; });

      nodeEnter.append("svg:text")
        .attr("x", function (d) { return d.children || d._children ? -10 : 10; })
        .attr("dy", ".35em")
        .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
        .text(function (d) { return d.id; })
        .style("fill-opacity", 1e-6);

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

      nodeUpdate.select("circle")
        .attr("r", 4.5)
        .attr("class", function (d) { return d._children ? "js-parent" : ''; });

      nodeUpdate.select("text")
        .style("fill-opacity", 1);

      // Transition existing nodes to the parent's new position.
      var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

      nodeExit.select("circle")
        .attr("r", 1e-6);

      nodeExit.select("text")
        .style("fill-opacity", 1e-6);

        // Update the links…
      var link = vis.selectAll("path.link")
        .data(tree.links(nodes), function (d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
      link.enter().insert("svg:path", "g")
        .attr("class", function (d) {
          return "link " + (d.target.path ? "js-path" : "");
        })
        .attr("d", function (d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        })
        .transition()
        .duration(duration)
        .attr("d", diagonal);

        // Transition links to their new position.
      link.transition()
        .duration(duration)
        .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
      link.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();

        // Stash the old positions for transition.
      nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    };

    showAll = function (d) {
      if (d._children) {
        toggle(d);
        update(d);
        setTimeout(function () {d.children.forEach(showAll); }, 500);
      }
    };

    return that;
  };

  closeAll = function (node) {
    if (node.children) {
      node.children.forEach(closeAll);
      toggle(node);
    }
  };

  // Toggle children.
  toggle = function (node) {
    if (node.children) {
      node._children = node.children;
      node.children = null;
    }
    else {
      node.children = node._children;
      node._children = null;
    }
  };


  return exports;
});


