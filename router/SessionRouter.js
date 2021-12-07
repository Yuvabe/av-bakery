var express = require('express');
var router = express.Router();
var crypto = require('crypto'); 
var util = require('util');
var path = require('path');

var callbackHelper = require('./CallbackHelper');

var requestError = {};
var requestData = {};
var filename = path.basename(__filename);
var sessionService = require('../service/SessionService');

var sessionManager = require('../middleware/SessionManager');

var httpRequest = null;



/**
 * handles http request to load the user login page
 * Loads the EJS admin/login
 */
 router.get('/login', (request, response) => {
  console.log("Loading login page");

  var authenticationFailed = request.query.authenticationFailed;

  if (authenticationFailed) {
    requestError = "Please Log In."
  }
  callbackHelper.setResponse(response);
  callbackHelper.setView("admin/login");
  callbackHelper.renderNextView(requestError, requestData);
});

/**
 * handles http request to load the user login page
 * Loads the EJS admin/login
 */
 router.post('/login', (request, response) => {
  console.log("Logging user");
  callbackHelper.setResponse(response);
  httpRequest = request;

  var credentials = {};
  credentials.loginId = request.body.login_id;
  credentials.password = request.body.password;

  if (!validateLoginCredentials(credentials)) {
    console.log("Request to login failed validation!");
    console.log("Error:" + JSON.stringify(requestError, null, 2))
    callbackHelper.setView("admin/login");
    callbackHelper.renderNextView(requestError, credentials);  
    return;
  }

  sessionService.loginUser(credentials, callbackIfLoginSuccessful.bind({ error: requestError, data: requestData }), callbackIfLoginFailed);

});

function callbackIfLoginFailed(credentials) {
  console.log("Executing callback: callbackIfLoginFailed");
  callbackHelper.setView("admin/login");
  requestError  = 'Login attempt failed';
  requestData = credentials;
  callbackHelper.renderNextView(requestError, requestData);
}

function callbackIfLoginSuccessful(error, data) {
  console.log("Executing callback: callbackIfLoginSuccessful");
  sessionManager.initializeUserSession(httpRequest, data[0]);
  callbackHelper.setView("admin/viewEdit");
  callbackHelper.renderNextView(error, data);
}

function validateLoginCredentials(credentials) {
  var loginId = credentials.loginId.trim();
  var password = credentials.password.trim();

  if (!callbackHelper.hasValue(loginId)) {
    requestError = 'Please enter a login id.';
    return false;
  }

  if (!callbackHelper.hasValue(password)) {
    requestError = 'Please enter a password.';
    return false;
  }
  return true;
}

module.exports = router;