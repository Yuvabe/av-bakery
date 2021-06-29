var express = require('express');

var util = require('util');

var path = require('path');
var filename = path.basename(__filename);

var router = express.Router();

var customerService = require('../service/CustomerService');
var utility = require('./Utility');

var httpResponse = {};
var requestError = {};
var requestData = {};

router.post('/searchCustomers', (request, response) => {
  if (!validateSearchRequest(request)) {
    response.status(400).send(requestError);
    return;
  }
  var requestJson = request.body;
  var searchBy = requestJson.searchBy;
  var searchString = requestJson.searchQuery;
  httpResponse = response;

  customerService.searchCustomer(
    searchString,
    searchBy,
    sendResponse.bind({ error: requestError, data: requestData })
  );
});

function sendResponse(error, data) {
  if (error) {
    console.log(error);
    httpResponse.status(501).send(error);
  } else {
    //console.log(data);
    httpResponse.status(201).send(data);
  }
}

function renderView(error, data) {
  console.log(data[0]);
  httpResponse.render('customer/edit', { customer: data[0], error: "" });
}

function validateSearchRequest(request) {
  var requestJson = request.body;
  var searchBy = requestJson.searchBy;
  var searchString = requestJson.searchQuery;
  if (!searchString) {
    requestError = 'Please enter a value to search';
    return false;
  }
  if (!searchBy) {
    requestError = 'Please select whether to search by account or name';
    return false;
  }

  if (searchBy == 'name' && utility.hasNumber(searchString)) {
    requestError = 'While searching by name do not include numbers in search text';
    return false;
  }

  if (searchBy == 'account' && isNaN(searchString)) {
    requestError = 'While searching by account only include numbers in search text';
    return false;
  }
  return true;
}

router.get('/customerEdit', (request, response) => {
  httpResponse = response;
  var customerId = request.query.customerId;
  console.log(util.format('%s: Fetching Customer Id: %s', filename, customerId));
  customerService.fetchCustomer(customerId, 'id', renderView.bind({ error: requestError, data: requestData }));
});

router.post('/customerSave', (request, response) => {
  httpResponse = response;
  var customer = {};
  customer.id = request.body.customerId;
  customer.name = request.body.customerName;
  customer.account = request.body.customerAccount;
  customer.community = request.body.customerCommunity;
  customer.phone = request.body.customerPhone;
  customer.email = request.body.customerEmail;
  customer.notes = request.body.customerNotes;

  console.log(customer);

  if (!validateCustomer(customer)) {
    httpResponse.render('customer/edit', { customer: customer, error: requestError });
    return;
  }

  httpResponse.render('customer/view', { customer: {} });
});

function validateCustomer(customer) {
    if (!utility.hasValue(customer.id)) {
      requestError = 'No customer id defined. Please contact support.';
      return false;
    }
    if (!utility.hasValue(customer.name)) {
      requestError = 'Name can not be empty.';
      return false;
    }
    if (!utility.hasValue(customer.account)) {
      requestError = 'Account can not be empty.';
      return false;
    }
    if (!utility.hasValue(customer.phone)) {
      requestError = 'Phone can not be empty.';
      return false;
    }
    if (!utility.hasValue(customer.email)) {
      requestError = 'E-mail can not be empty.';
      return false;
    }
    return true;
  }

router.get('customerGet', (request, response) => {

});

module.exports = router;
