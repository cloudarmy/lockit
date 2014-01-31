
var path = require('path');
var extend = require('node.extend');
var signup = require('lockit-signup');
var login = require('lockit-login');
var forgotPassword = require('lockit-forgot-password');
var deleteAccount = require('lockit-delete-account');

var configDefault = require('./config.default.js');

// just some sugar and a wrapper around the single modules
module.exports = function(app, config) {

  // set basedir so views can properly extend layout.jade
  var __parentDir = path.dirname(module.parent.filename);
  app.locals.basedir = path.join(__parentDir, '/views');
  
  // check for database settings - only ones that are really required
  if (!config.db) throw new Error('Please specify database settings');

  // check for email settings
  if (!config.emailType || !config.emailSettings) {
    console.log('Email configuration incomplete -> using "stub".\nCheck your database for tokens.');
  }
  
  // use default values for all values that aren't provided
  // true for deep extend
  config = extend(true, configDefault, config);
  
  // send all GET requests for lockit routes to '/'
  if (config.rest) {
    
    var routes = [
      config.signup.route,
      config.login.route,
      config.login.logoutRoute,
      config.forgotPassword.route,
      config.deleteAccount.route,
    ].map(function(route) { return '^\\' + route });

    var re = new RegExp(routes.join('|'));

    // point all lockit routes to index
    app.get(re, function(req, res) {
      res.render('index');
    });
  }

  // expose username and email to template engine
  app.use(function(req, res, next) {
    res.locals.username = req.session.username || '';
    res.locals.email = req.session.email || '';
    // continue with next middleware
    next();
  });
  
  // load all required modules
  signup(app, config);
  login(app, config);
  forgotPassword(app, config);
  deleteAccount(app, config);

};