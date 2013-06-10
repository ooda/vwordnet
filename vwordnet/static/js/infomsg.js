/*global */
define(["jquery", "viewmodel", "bootstrap", "knockout"],
function ($, viewmodel, bootstrap, ko) {
  var exports = {}, setTimer, timerId;

  // Extend the viewmodel
  viewmodel.alertHeading = ko.observable('');
  viewmodel.alertMsg = ko.observable();

  // Handler for async calls. The response text from the server needs to be
  // application/json.
  exports.ajaxHandler = function (jqXHR, textStatus, errorThrown, timeout) {
    var error = JSON.parse(jqXHR.responseText);
    exports.error(error.status_code + "  " + errorThrown,
      error.message, timeout);
    console.log(error.status_code, errorThrown, error.message);
  };

  // Show an error message at the top of the window, absolutely speaking.
  exports.error = function (title, message, timeout) {
    $(".js-wait").hide();
    $("#jsAlert").toggleClass("alert-error", true);

    viewmodel.alertHeading(title);
    if (message === undefined) {
      message =  "We're sorry, but an unknown error has occured." +
            " Our team has been contacted and we are working to solve " +
            "this issue.";
    }
    viewmodel.alertMsg(message);
    setTimer(timeout);
  };

  // Show an information message at the top of the window, absolutely speaking.
  exports.info = function (title, message, timeout) {
    $("#jsAlert").toggleClass("alert-error", false);

    viewmodel.alertHeading(title);
    viewmodel.alertMsg(message);
    setTimer(timeout);
  };

  setTimer = function (timeout) {
    if (timeout === 0) {
      return;
    }
    timeout = timeout || 10000;
    timerId = setTimeout(function () {
      $("#jsAlert").trigger("close");
    }, timeout);
  };

  // Hide the alert box.
  exports.clear = function () {
    clearTimeout(timerId);
    viewmodel.alertHeading('');
    viewmodel.alertMsg('');
  };

  // When the info box's close button is clicked, remove all messages and
  // make sure the usual stuff is not execute by returning false.
  $('#jsAlert').bind('close', function () {
    exports.clear();
    return false;
  });

  return exports;
});

