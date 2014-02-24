/* Author: Hugues Demers
 * Copyrights 2013
*/
require({
  paths: {
    "jquery": "other/jquery-2.1.0.min",
    "kinetic": "other/jquery.kinetic.min",
    "knockout": "other/knockout-2.2.1",
    "underscore": "other/underscore-min",
    "domReady": "other/domReady",
    "highcharts": "other/highcharts",
    "bootstrap": "other/bootstrap.min",
    "moment": "other/moment.min",
    "d3": "d3",
    "pusher": "https://d3dy5gmtp8yhk7.cloudfront.net/2.0/pusher.min",
    "topo": "other/topojson.v1.min",
    "projection": "other/d3.geo.projection.v0.min"
  },
  shim: {
    'underscore': {
      exports: '_'
    },
    'knockout': {
      exports: 'ko'
    },
    'moment': {
      exports: 'moment'
    },
    'pusher': {
      exports: 'Pusher'
    },
    'd3': {
      exports: 'd3'
    },
    'topo': {
      exports: 'topo',
      deps: ['d3']
    },
    'projection': {
      exports: 'projection',
      deps: ['d3']
    },
    'bootstrap': {
      exports: 'bootstrap',
      deps: ['jquery']
    },
    'kinetic': {
      exports: 'kinetic',
      deps: ['jquery']
    }
  }
});

require(['domReady', 'app'],
function (domReady, app) {
  domReady(function () {
    console.log("DOM ready.");
    app.initialize();
  });
});


