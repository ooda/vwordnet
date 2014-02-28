/* Author: Hugues Demers
 * Copyrights 2013
  
*/
define([
  "jquery",
  "underscore",
  "viewmodel",
  "d3",
  "knockout",
  "bootstrap"
],
function  ($, _, viewmodel, d3, ko) {
  var exports = {},
    closeAll, toggle, makeTree, reduce, expand, expandReduce, makeNodeContent,
    moreNodeName = "... more ...";

  // One-time initialization of popovers.
  $('body').popover({
    trigger: 'hover',
    placement: 'auto',
    container: 'body',
    selector: 'svg g',
    html: true
  });

  exports.build = function (options) {
    var that = {},
      defaults = {
        container: null
      },
      root, tree, diagonal, vis,
      showAll, update,
      opts = _.defaults(options, defaults),
        sizeX = 15, sizeY = 220;
    
    that.draw = function  (rootNode) {
      var width, height,
        m = [20, 20, 20, 120];

      root = rootNode;
      tree = d3.layout.tree().size(null).elementsize([sizeX, sizeY]);

      var nodes = tree.nodes(root);
      var maxX = d3.max(nodes, function (d) {return d.x; });
      var maxY = d3.max(nodes, function (d) {return d.y; });

      height = maxX + sizeX;
      width = maxY + sizeY;
      
      diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.y, d.x]; });

      vis = opts.container.append("svg:svg")
        .attr("width", width + m[1] + m[3])
        .attr("height", height + m[0] + m[2])
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

      root.x0 = height / 2;
      root.y0 = 0;
  
      // Make-up unique identifiers
      nodes.forEach(function (d) {
        d.id = (d.parent ? d.parent.name : "root") + "-" + d.name;
      });

      //reduce(root);
      update(root);
    };

    update = function  (source) {
      var duration = d3.event && d3.event.altKey ? 5000 : 500;

      // Compute the new tree layout.
      var nodes = tree.nodes(root).reverse();

      // Update the nodes…
      var node = vis.selectAll("g.js-node")
        .data(nodes, function (d) { return d.id; });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("svg:g")
        .attr("class", function (d) {
          return "js-node " + (d.path ? "js-path": '');
        })
        .attr("transform", function (d) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .attr("data-title", function (d) {return d.name; })
        .attr("data-content", function (d) {return makeNodeContent(d); })
        .on("click", function (d) {
          if (d3.event.ctrlKey) {
            //expandReduce(d, true);
            //update(d);
          }
          else {
            toggle(d);
            update(d);
          }
        });

      nodeEnter.append("svg:circle")
        .attr("r", 1e-6)
        .attr("class", function (d) {return d._children ? "js-parent" : ''; });

      nodeEnter.append("svg:text")
        .attr("x", function (d) {
          return d.children || d._children ? -10 : 10;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", function (d) {
          return d.children || d._children ? "end" : "start";
        })
        .text(function (d) { return d.name || d.id; })
        .style("fill-opacity", 1e-6)
        .attr("class", function (d) {
          return d.name === moreNodeName ? "js-more-node" : '';
        })
        .on("click", function (d) {
          if (d.name === moreNodeName && d.parent) {
            expand(d.parent);
            update(d);
          }
        });

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) {
          return "translate(" + d.y + "," + d.x + ")";
        });

      nodeUpdate.select("circle")
        .attr("r", 3.5)
        .attr("class", function (d) {return d._children ? "js-parent" : ''; });

      nodeUpdate.select("text")
        .style("fill-opacity", 1);

      // Transition existing nodes to the parent's new position.
      var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) {
          return "translate(" + source.y + "," + source.x + ")";
        })
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

  // Reduce the number of children for the given node. Recurse.
  reduce = function (node) {
    var has_children = function (n) {return n.children ? true : false; },
      n = 5, nMissing;

    if (node.children) {
      if (node.children.length > 10) {
        node._with_children = _.filter(node.children, has_children);
        node._without_children = _.reject(node.children, has_children);

        nMissing = n - node._with_children.length;
        node.children = _.clone(node._with_children)
          .concat(
            _.first(node._without_children, nMissing));

        node.children.push({
          name: moreNodeName
        });
      }
      node.children.forEach(reduce);
    }
  };

  expand = function (node, recurse) {
    if (node.children) {
      if (node._with_children && node._without_children) {
        node.children = node._with_children.concat(node._without_children);
        node._with_children = null;
        node._without_children = null;
      }
      if (recurse) {
        _.each(node.children, function (child) {expand(child, true); });
      }
    }
  };

  _.mixin({
    toggle: function (fn1, fn2) {
      var fn = fn1;
      return function () {
        var result = fn.apply(this, arguments);
        fn = fn === fn1 ? fn2 : fn1;
        return result;
      };
    }
  });

  makeNodeContent = function (node) {
    var content = node.definition;
    if (node.lemmas) {
      content += "<br /><br /><em>";
      node.lemmas.forEach(function (d) { content += d.name + ", "; });
      content = content.slice(0, -2) + "</em>";
    }
    return content;
  };

  expandReduce = _.toggle(expand, reduce);

  return exports;
});


