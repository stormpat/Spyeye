#!/usr/bin/env node

var request = require('request');
var colors = require('colors');
var program = require('commander');
var events = require('events');
var util = require('util');
var eventEmitter = new events.EventEmitter();
var settings = require('./settings');

var ses = settings.session;
var uri = settings.endpoint;

var Spyeye = function(email) {
  this.email = email;
}
Spyeye.prototype = {

  getToken: function() {
    var self = this;
    request(ses + this.email, function(error, response, data) {
      if (error) {
        console.log("ERROR " + error);
      };
      var data_token = JSON.parse(data);
      eventEmitter.emit('TOKEN', data_token.session_token, self);
    });
  },
  getData: function(token, self) {
    var options = {
      url: uri + self.email,
      headers: { 'X-Session-Token': token }
    }
    request(options, function(error, response, body) {
      var info = JSON.parse(body);
      eventEmitter.emit('READY', true);
      self.displayResult(info);
    });
  },
  displayResult: function(data) {
    if (data.error_code) {
      console.log("Rate limit exceeded".red);
      return;
    }
    console.log("------------------------------------------------".green);
    console.log("--------------------RESULTS---------------------".green + "\n");
    console.log("Personal info: ".green + "\n");
    console.log("Full name: ".cyan + data.contact.first_name + " " + data.contact.last_name + " (" + data.contact.headline + ")");
    console.log("Nickname: ".cyan + data.contact.friendly_name);
    console.log("Location: ".cyan + data.contact.location);
    console.log("Organisations ".cyan + data.contact.organisation.title);
    console.log( "\n" + "Images ".green + "\n");

    for (var i = data.contact.images.length - 1; i >= 0; i--) {
      console.log(data.contact.images[i].service + " - " + data.contact.images[i].url);
    };
  }
}

program
  .version(require('./package.json').version)

program
  .command('find [email]')
  .description('Find by email address.')
  .action(function(email, options) {
    console.log("Searching for %s", email);
    var spy = new Spyeye(email);
    spy.getToken();
    eventEmitter.on('TOKEN', spy.getData);

});

program.parse(process.argv);
